type NotionProperty = {
  type?: string;
  title?: Array<{ plain_text?: string }>;
  rich_text?: Array<{ plain_text?: string }>;
  select?: { name?: string } | null;
  multi_select?: Array<{ name?: string }>;
  status?: { name?: string } | null;
  checkbox?: boolean;
  date?: { start?: string; end?: string | null } | null;
  formula?: { type?: string; string?: string | null } | null;
};

type NotionPage = {
  id: string;
  properties?: Record<string, NotionProperty>;
  parent?: { type?: string; database_id?: string; data_source_id?: string };
};
type NotionBlock = { id: string; type: string; has_children?: boolean; [key: string]: unknown };

export type NotionContentBlock = { id: string; type: string; text: string; language?: string; depth: number };

export type NotionInterviewExperience = {
  pageId: string;
  title: string;
  company: string;
  date: string;
};

export type NotionInterviewSource = NotionInterviewExperience & { blocks: NotionContentBlock[] };

const apiBase = "https://api.notion.com/v1";

function getConfig() {
  const token = process.env.NOTION_TOKEN;
  const databaseId = process.env.NOTION_INTERVIEW_DATABASE_ID;
  if (!token || !databaseId) {
    return null;
  }
  return { token, databaseId };
}

function text(property?: NotionProperty) {
  return [...(property?.title || []), ...(property?.rich_text || [])]
    .map((item) => item.plain_text || "")
    .join("")
    .trim() || property?.formula?.string?.trim() || "";
}

function select(property?: NotionProperty) {
  return property?.select?.name || property?.status?.name || property?.multi_select?.map((item) => item.name || "").filter(Boolean).join(", ") || property?.date?.start || text(property);
}

function findProperty(properties: Record<string, NotionProperty>, names: string[]) {
  for (const name of names) if (properties[name]) return properties[name];
  for (const name of names) {
    const found = Object.entries(properties).find(([key]) => key.toLowerCase() === name.toLowerCase());
    if (found) return found[1];
  }
  return undefined;
}

function pageSummary(page: NotionPage): NotionInterviewExperience {
  const properties = page.properties || {};
  const title = text(findProperty(properties, ["名称", "Name", "Title", "标题"])) || "Untitled interview experience";
  return {
    pageId: page.id,
    title,
    company: select(findProperty(properties, ["公司", "Company"])) || "Unspecified",
    date: select(findProperty(properties, ["面试日期", "日期", "Date", "Interview Date"])),
  };
}

function headers(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json",
  };
}

async function notionRequest<T>(url: string, init: RequestInit): Promise<T> {
  const method = init.method || "GET";
  let response: Response | undefined;
  let networkError: unknown;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      response = await fetch(url, { ...init, cache: "no-store", signal: AbortSignal.timeout(15_000) });
      break;
    } catch (error) {
      networkError = error;
      if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, 300 * attempt));
    }
  }

  if (!response) {
    const message = networkError instanceof Error ? networkError.message : String(networkError);
    console.error("Notion API Error:", { url, method, status: "NETWORK_ERROR", body: "", error: networkError });
    throw new Error(`Notion request failed after 3 attempts. URL: ${url}. Status: NETWORK_ERROR. Error: ${message}`);
  }

  let responseText: string;
  try {
    responseText = await response.text();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Notion API Error:", {
      url,
      method,
      status: response.status,
      body: "<unavailable: response stream failed>",
      error,
    });
    throw new Error(
      `Notion response read failed. URL: ${url}. Status: ${response.status}. Error: ${message}`,
    );
  }
  if (!response.ok) {
    console.error("Notion API Error:", {
      url,
      method,
      status: response.status,
      body: responseText,
    });
    throw new Error(
      `Notion request failed. URL: ${url}. Status: ${response.status}. Response: ${responseText}`,
    );
  }

  try {
    return JSON.parse(responseText) as T;
  } catch (error) {
    console.error("Notion API Error:", {
      url,
      method,
      status: response.status,
      body: responseText,
      error,
    });
    throw new Error(
      `Notion returned invalid JSON. URL: ${url}. Status: ${response.status}. Response: ${responseText}`,
    );
  }
}

export function isNotionInterviewImportConfigured() {
  return Boolean(getConfig());
}

export async function listNotionInterviewExperiences(): Promise<NotionInterviewExperience[]> {
  const config = getConfig();
  if (!config) return [];

  const results: NotionPage[] = [];
  let cursor: string | undefined;
  do {
    const url = `${apiBase}/databases/${config.databaseId}/query`;
    const body = await notionRequest<{ results?: NotionPage[]; has_more?: boolean; next_cursor?: string | null }>(url, { method: "POST", headers: headers(config.token), body: JSON.stringify({ page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) }) });
    results.push(...(body.results || []));
    cursor = body.has_more && body.next_cursor ? body.next_cursor : undefined;
  } while (cursor);
  return results.map(pageSummary);
}

function blockText(block: NotionBlock) {
  const value = block[block.type] as { rich_text?: Array<{ plain_text?: string }>; language?: string } | undefined;
  return { text: (value?.rich_text || []).map((item) => item.plain_text || "").join(""), language: value?.language };
}

function propertyBlocks(page: NotionPage): NotionContentBlock[] {
  const blocks: NotionContentBlock[] = [];
  for (const [name, property] of Object.entries(page.properties || {})) {
    const value = select(property);
    if (!value) continue;
    blocks.push({ id: `${page.id}:property:${name}:heading`, type: "heading_2", text: name, depth: 0 });
    blocks.push({ id: `${page.id}:property:${name}:value`, type: "paragraph", text: value, depth: 0 });
  }
  return blocks;
}

async function readBlockChildren(blockId: string, depth = 0): Promise<NotionContentBlock[]> {
  const config = getConfig();
  if (!config) throw new Error("Notion is not configured.");
  const output: NotionContentBlock[] = [];
  let cursor: string | undefined;
  do {
    const query = new URLSearchParams({ page_size: "100", ...(cursor ? { start_cursor: cursor } : {}) });
    const url = `${apiBase}/blocks/${blockId}/children?${query}`;
    const body = await notionRequest<{ results?: NotionBlock[]; has_more?: boolean; next_cursor?: string | null }>(url, { method: "GET", headers: headers(config.token) });
    for (const block of body.results || []) {
      const content = blockText(block);
      if (content.text || block.type === "divider") output.push({ id: block.id, type: block.type, text: content.text, language: content.language, depth });
      if (block.has_children) output.push(...await readBlockChildren(block.id, depth + 1));
    }
    cursor = body.has_more && body.next_cursor ? body.next_cursor : undefined;
  } while (cursor);
  return output;
}

export async function getNotionInterviewSource(pageId: string): Promise<NotionInterviewSource> {
  const config = getConfig();
  if (!config) throw new Error("Notion is not configured.");

  const pageUrl = `${apiBase}/pages/${encodeURIComponent(pageId)}`;
  const page = await notionRequest<NotionPage>(pageUrl, {
    method: "GET",
    headers: headers(config.token),
  });
  const parentId = page.parent?.database_id || page.parent?.data_source_id || "";
  const normalizeId = (value: string) => value.replace(/-/g, "").toLowerCase();
  if (parentId && normalizeId(parentId) !== normalizeId(config.databaseId)) {
    throw new Error(`Notion page ${pageId} is not part of the configured interview database.`);
  }

  const source = pageSummary(page);
  const pageBlocks = await readBlockChildren(pageId);
  const fallbackBlocks = propertyBlocks(page);
  if (!pageBlocks.length && !fallbackBlocks.length) throw new Error(`No blocks found for page ${pageId}`);
  const blocks = pageBlocks.length
    ? pageBlocks
    : [
        { id: `${pageId}:empty-block-notice`, type: "paragraph", text: `No blocks found for page ${pageId}. Using database properties.`, depth: 0 },
        ...fallbackBlocks,
      ];
  return { ...source, blocks };
}

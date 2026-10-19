export type JudgeLanguage = "Java" | "C++";

const DEFAULT_ENDPOINT = "https://ce.judge0.com";
const DEFAULT_LANGUAGE_IDS: Record<JudgeLanguage, number> = {
  Java: 62,
  "C++": 54,
};

type Judge0Result = {
  stdout?: string | null;
  stderr?: string | null;
  compile_output?: string | null;
  message?: string | null;
  status?: { id?: number; description?: string };
  token?: string;
};

function endpoint() {
  return (process.env.JUDGE0_API_URL || DEFAULT_ENDPOINT).replace(/\/$/, "");
}

function languageId(language: JudgeLanguage) {
  const configured = language === "Java" ? process.env.JUDGE0_JAVA_LANGUAGE_ID : process.env.JUDGE0_CPP_LANGUAGE_ID;
  const parsed = Number(configured);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : DEFAULT_LANGUAGE_IDS[language];
}

async function judgeFetch(path: string, init?: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 18_000);
  try {
    return await fetch(`${endpoint()}${path}`, {
      ...init,
      cache: "no-store",
      signal: controller.signal,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function executeWithJudge0(language: JudgeLanguage, sourceCode: string, stdin: string) {
  const response = await judgeFetch("/submissions?base64_encoded=false&wait=true", {
    method: "POST",
    body: JSON.stringify({ source_code: sourceCode, language_id: languageId(language), stdin, cpu_time_limit: 3, wall_time_limit: 8, memory_limit: 128000 }),
  });
  const result = await response.json().catch(() => ({})) as Judge0Result;
  if (!response.ok) throw new Error(result.message || `Judge0 request failed (${response.status}).`);

  // Some Judge0 deployments ignore wait=true. Poll the returned token when needed.
  let final = result;
  if (result.token && (!result.status || (result.status.id || 0) <= 2)) {
    for (let attempt = 0; attempt < 8; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const poll = await judgeFetch(`/submissions/${result.token}?base64_encoded=false&fields=stdout,stderr,compile_output,message,status`);
      final = await poll.json() as Judge0Result;
      if ((final.status?.id || 0) > 2) break;
    }
  }

  const output = [final.compile_output, final.stderr, final.stdout, final.message].filter(Boolean).join("\n").trim();
  const success = final.status?.id === 3;
  return {
    success,
    output: output || final.status?.description || "Program completed without output.",
    status: final.status?.description || "Unknown",
  };
}

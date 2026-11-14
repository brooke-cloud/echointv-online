import { Pool } from "pg";
import { retryAsync } from "./retry";

export type ProblemCatalogItem = {
  id: number;
  slug: string;
  title: string;
  company: string;
  role: string;
  difficulty: string;
  category: string;
  description: string;
  topics: string[];
  stage: string;
  isFree: boolean;
};

const rawConnectionString = process.env.DATABASE_URL;

function runtimeConnectionString() {
  if (!rawConnectionString) throw new Error("DATABASE_URL is not configured.");
  const url = new URL(rawConnectionString);
  if (url.hostname.endsWith(".neon.tech") && !url.hostname.includes("-pooler.")) {
    url.hostname = url.hostname.replace(/^(ep-[^.]+)/, "$1-pooler");
  }
  return url.toString();
}

const globalForCatalog = globalThis as unknown as { problemCatalogPool?: Pool };

const problemCatalogPool = globalForCatalog.problemCatalogPool ?? new Pool({
  connectionString: runtimeConnectionString(),
  max: 3,
  connectionTimeoutMillis: 15_000,
  idleTimeoutMillis: 30_000,
  query_timeout: 30_000,
  keepAlive: true,
});

if (process.env.NODE_ENV !== "production") {
  globalForCatalog.problemCatalogPool = problemCatalogPool;
}

export function loadProblemCatalog() {
  return retryAsync(
    async () => {
      const result = await problemCatalogPool.query<ProblemCatalogItem>(`
        SELECT
          "id", "slug", "title", "company", "role", "difficulty",
          "category", "description", "topics", "stage", "isFree"
        FROM "Problem"
        ORDER BY "id" ASC
      `);
      return result.rows;
    },
    { attempts: 3, delayMs: 500 },
  );
}

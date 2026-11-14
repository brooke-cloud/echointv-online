import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import pg from "pg";

const outputPath = resolve("data/problem-catalog.snapshot.json");
let lastError;

for (let attempt = 1; attempt <= 5; attempt += 1) {
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 15_000,
  });
  try {
    await client.connect();
    const result = await client.query(`
      SELECT
        "id", "slug", "title", "company", "role", "difficulty",
        "category", "description", "topics", "stage", "isFree"
      FROM "Problem"
      ORDER BY "id" ASC
    `);
    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, `${JSON.stringify(result.rows, null, 2)}\n`, "utf8");
    console.log(`Synced ${result.rows.length} problems to ${outputPath}`);
    lastError = undefined;
    break;
  } catch (error) {
    lastError = error;
    if (attempt < 5) await new Promise((resolveDelay) => setTimeout(resolveDelay, attempt * 1_000));
  } finally {
    await client.end().catch(() => undefined);
  }
}

if (lastError) throw lastError;

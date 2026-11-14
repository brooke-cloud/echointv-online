import "dotenv/config";
import pg from "pg";

let lastError;
for (let attempt = 1; attempt <= 3; attempt += 1) {
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 15_000 });
  try {
    await client.connect();
    const problems = await client.query('SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE "isFree")::int AS free FROM "Problem"');
    const posts = await client.query('SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE "isFree")::int AS free FROM "Post"');
    const migration = await client.query("SELECT finished_at, applied_steps_count FROM _prisma_migrations WHERE migration_name = $1", ["20261113120000_add_explicit_content_access"]);
    if (!migration.rowCount || !migration.rows[0].finished_at || migration.rows[0].applied_steps_count !== 1) {
      throw new Error("Explicit content access migration is not recorded as complete.");
    }
    console.log(JSON.stringify({ problems: problems.rows[0], posts: posts.rows[0], migration: "applied" }, null, 2));
    lastError = undefined;
    break;
  } catch (error) {
    lastError = error;
    if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, attempt * 1_000));
  } finally {
    await client.end().catch(() => undefined);
  }
}
if (lastError) throw lastError;

import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { resolve } from "node:path";

const testDirectory = resolve(process.cwd(), "tests");
const testFiles = readdirSync(testDirectory)
  .filter((name) => name.endsWith(".test.ts"))
  .sort();

if (!testFiles.length) {
  console.error("No offline test files were found.");
  process.exit(1);
}

for (const testFile of testFiles) {
  console.log(`\n> ${testFile}`);
  const result = spawnSync(process.execPath, [
    "--import",
    "data:text/javascript,process.geteuid=()=>24790",
    "--import",
    "tsx",
    resolve(testDirectory, testFile),
  ], { stdio: "inherit", env: process.env });

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }
  if (result.status !== 0) process.exit(result.status || 1);
}

console.log(`\n${testFiles.length} offline test files passed.`);

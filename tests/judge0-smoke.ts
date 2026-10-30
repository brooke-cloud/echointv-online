import assert from "node:assert/strict";
import { executeWithJudge0 } from "../lib/judge0";
import { buildJudgeSource } from "../lib/code-harness";

async function main() {
  const cpp = await executeWithJudge0("C++", "#include <iostream>\nint main(){std::cout << 42 << std::endl;}", "");
  assert.equal(cpp.success, true, cpp.output);
  assert.match(cpp.output, /42/);

  const java = await executeWithJudge0("Java", "class Main { public static void main(String[] args) { System.out.println(42); } }", "");
  assert.equal(java.success, true, java.output);
  assert.match(java.output, /42/);

  const javascript = await executeWithJudge0("JavaScript", "console.log(42);", "");
  assert.equal(javascript.success, true, javascript.output);
  assert.match(javascript.output, /42/);

  const sql = await executeWithJudge0("SQL", "CREATE TABLE numbers (value INTEGER);\nINSERT INTO numbers VALUES (42);\nSELECT value FROM numbers;", "");
  assert.equal(sql.success, true, sql.output);
  assert.match(sql.output, /42/);

  const input = "nums = [1, 2, 3]\nk = 2";
  const parameters = [{ name: "nums", type: "int[]" }, { name: "k", type: "int" }];
  const cppHarness = buildJudgeSource("C++", "#include <bits/stdc++.h>\nusing namespace std;\nauto solve(vector<int>& nums, int k) { return nums[k]; }", input, "solve", parameters);
  const cppResult = await executeWithJudge0("C++", cppHarness.sourceCode, cppHarness.stdin);
  assert.equal(cppResult.success, true, cppResult.output);
  assert.match(cppResult.output, /3/);

  const javaHarness = buildJudgeSource("Java", "class Solution { public Object solve(int[] nums, int k) { return nums[k]; } }", input, "solve", parameters);
  const javaResult = await executeWithJudge0("Java", javaHarness.sourceCode, javaHarness.stdin);
  assert.equal(javaResult.success, true, javaResult.output);
  assert.match(javaResult.output, /3/);

  const javascriptHarness = buildJudgeSource("JavaScript", "function solve(nums, k) { return nums[k]; }", input, "solve", parameters);
  const javascriptResult = await executeWithJudge0("JavaScript", javascriptHarness.sourceCode, javascriptHarness.stdin);
  assert.equal(javascriptResult.success, true, javascriptResult.output);
  assert.match(javascriptResult.output, /3/);
  console.log("Judge0 C++, Java, JavaScript, and SQL smoke tests passed");
}

main().catch((error) => { console.error(error); process.exitCode = 1; });

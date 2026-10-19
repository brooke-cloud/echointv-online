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
  console.log("Judge0 C++ and Java smoke tests passed");
}

main().catch((error) => { console.error(error); process.exitCode = 1; });

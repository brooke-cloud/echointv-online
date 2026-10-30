import assert from "node:assert/strict";
import { buildJudgeSource } from "../lib/code-harness";

const parameters = [{ name: "nums", type: "int[]" }, { name: "k", type: "int" }];
const input = "nums = [1, 2, 3]\nk = 2";

const java = buildJudgeSource("Java", "class Solution { public Object solve(int[] nums, int k) { return nums; } }", input, "solve", parameters);
assert.match(java.sourceCode, /public static void main/);
assert.match(java.sourceCode, /int\[\] nums = new int\[\]\{1, 2, 3\}/);
assert.match(java.sourceCode, /new Solution\(\)\.solve\(nums, k\)/);

const cpp = buildJudgeSource("C++", "#include <bits/stdc++.h>\nusing namespace std;\nauto solve(vector<int>& nums, int k) { return nums; }", input, "solve", parameters);
assert.match(cpp.sourceCode, /int main\(\)/);
assert.match(cpp.sourceCode, /vector<int> nums = \{1, 2, 3\}/);
assert.match(cpp.sourceCode, /solve\(nums, k\)/);

const standalone = buildJudgeSource("C++", "int main() {}", "hello", "", []);
assert.equal(standalone.stdin, "hello");

const javascript = buildJudgeSource("JavaScript", "function solve(nums, k) { return nums[k]; }", input, "solve", parameters);
assert.match(javascript.sourceCode, /const nums = \[1, 2, 3\];/);
assert.match(javascript.sourceCode, /Promise\.resolve\(solve\(nums, k\)\)/);
assert.equal(javascript.stdin, "");

const standaloneJavascript = buildJudgeSource("JavaScript", "console.log('Start');", "raw input", "", []);
assert.equal(standaloneJavascript.sourceCode, "console.log('Start');");
assert.equal(standaloneJavascript.stdin, "raw input");
console.log("code harness tests passed");

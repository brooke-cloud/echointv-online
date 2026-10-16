import assert from "node:assert/strict";
import { createPracticeTemplates, normalizeProblemFunctionDescription } from "../lib/problem-function";
import { normalizeInterviewImportPayload } from "../lib/interview-import-schema";

const functionDescription = normalizeProblemFunctionDescription({
  functionName: "kSmallestPairs",
  parameters: [
    { name: "nums1", type: "", description: "integer array" },
    { name: "nums2", type: "", description: "integer array" },
    { name: "k", type: "", description: "integer" },
  ],
  returnDescription: "pairs",
});

assert.equal(functionDescription.functionName, "kSmallestPairs");
assert.deepEqual(functionDescription.parameters.map((parameter) => parameter.type), ["integer array", "integer array", "integer"]);
assert.ok(functionDescription.parameters.every((parameter) => parameter.description.length > 0));

const templates = createPracticeTemplates(functionDescription);
assert.ok(templates["Python 3"].startsWith("def kSmallestPairs(nums1, nums2, k):"));
assert.match(templates.Java, /kSmallestPairs\(int\[\] nums1, int\[\] nums2, int k\)/);
assert.match(templates["C++"], /kSmallestPairs\(vector<int>& nums1, vector<int>& nums2, int k\)/);
assert.doesNotMatch(templates.Java, /\bsolve\s*\(/);
assert.doesNotMatch(templates["C++"], /\bsolve\s*\(/);

const joinedLegacyParameters = normalizeProblemFunctionDescription({}, {
  functionParameters: "nums1 | List[int] | The first sorted integer array.nums2 | List[int] | The second sorted integer array.k | int | The maximum number of pairs to return.",
});
assert.deepEqual(joinedLegacyParameters.parameters, [
  { name: "nums1", type: "List[int]", description: "The first sorted integer array." },
  { name: "nums2", type: "List[int]", description: "The second sorted integer array." },
  { name: "k", type: "int", description: "The maximum number of pairs to return." },
]);

const imported = normalizeInterviewImportPayload({
  title: "K Smallest Pairs From Two Arrays",
  company: "Google",
  problemDescription: "Return the k pairs with the smallest sums.",
  functionDescription,
  solution: {
    python: "def solve(nums1, nums2, k):\n    return []",
    java: "class Solution { Object solve(int[] nums1, int[] nums2, int k) { return null; } }",
    cpp: "class Solution { auto solve(vector<int>& nums1, vector<int>& nums2, int k) { return 0; } };",
  },
});

assert.match(imported.solution.python, /def kSmallestPairs\(nums1, nums2, k\):/);
assert.match(imported.solution.java, /kSmallestPairs\(int\[\] nums1/);
assert.match(imported.solution.cpp, /kSmallestPairs\(vector<int>& nums1/);

console.log("problem function synchronization tests passed");

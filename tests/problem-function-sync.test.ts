import assert from "node:assert/strict";
import { alignSolutionFunctionName, createPracticeTemplates, normalizeProblemFunctionDescription, preferredSolutionLanguage, primaryFunctionName } from "../lib/problem-function";
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
assert.match(templates.JavaScript, /function kSmallestPairs\(nums1, nums2, k\)/);
assert.doesNotMatch(templates.Java, /\bsolve\s*\(/);
assert.doesNotMatch(templates["C++"], /\bsolve\s*\(/);
assert.match(templates["C++"], /^#include <bits\/stdc\+\+\.h>\nusing namespace std;/);
assert.doesNotMatch(templates["C++"], /class\s+Solution/);

const noFixedFunctionTemplates = createPracticeTemplates(normalizeProblemFunctionDescription({
  functionName: "No fixed function name",
  parameters: [],
}));
assert.equal(noFixedFunctionTemplates["Python 3"], "# Write your solution here\n");
assert.equal(noFixedFunctionTemplates.Java, "// Write your solution here\n");
assert.equal(noFixedFunctionTemplates["C++"], "// Write your solution here\n");
assert.equal(noFixedFunctionTemplates.JavaScript, "// Write your solution here\n");
assert.doesNotMatch(noFixedFunctionTemplates["Python 3"], /def\s+solve|\bpass\b/);

assert.equal(preferredSolutionLanguage({ solutionCpp: "#include <vector>" }), "C++");
assert.equal(preferredSolutionLanguage({ solutionJavascript: "const solve = () => {};" }), "JavaScript");
assert.equal(preferredSolutionLanguage({ solution: "const solve = (nums) => nums.length;", solutionLanguage: "javascript" }), "JavaScript");
assert.match(alignSolutionFunctionName("const solve = (nums) => nums.length;", "maxDistance", "JavaScript"), /const maxDistance\s*=/);
assert.match(alignSolutionFunctionName("function solve(nums) { return nums.length; }", "maxDistance", "JavaScript"), /function maxDistance\s*\(/);
assert.equal(preferredSolutionLanguage({ solutionJava: "class Solution {}" }), "Java");
assert.equal(preferredSolutionLanguage({ solutionPython: "def solve(): pass", solutionJava: "class Solution {}", solutionCpp: "#include <vector>" }), "Python 3");
assert.equal(preferredSolutionLanguage({ solution: "#include <vector>\nusing namespace std;", solutionLanguage: "python" }), "C++");

const multipleFunctionNames = normalizeProblemFunctionDescription({ functionName: "sigmoid, fit_q1, predict_q1, fit_q2, predict_q2", parameters: [] });
assert.equal(multipleFunctionNames.functionName, "sigmoid, fit_q1, predict_q1, fit_q2, predict_q2");
assert.equal(primaryFunctionName(multipleFunctionNames.functionName), "sigmoid");
assert.match(createPracticeTemplates(multipleFunctionNames)["Python 3"], /^def sigmoid\(\):/);

const signatureFunctionName = normalizeProblemFunctionDescription({
  functionName: "maxDistance(grid)",
  parameters: [{ name: "grid", type: "integer array", description: "Input grid." }],
});
assert.equal(primaryFunctionName(signatureFunctionName.functionName), "maxDistance");
assert.match(createPracticeTemplates(signatureFunctionName)["Python 3"], /^def maxDistance\(grid\):/);
assert.doesNotMatch(createPracticeTemplates(signatureFunctionName)["Python 3"], /def solve\(/);

const signatureWithMultipleParameters = normalizeProblemFunctionDescription({ functionName: "calculate(left, right), formatResult(value)", parameters: [] });
assert.equal(primaryFunctionName(signatureWithMultipleParameters.functionName), "calculate");
assert.match(createPracticeTemplates(signatureWithMultipleParameters)["Python 3"], /^def calculate\(\):[\s\S]*def formatResult\(\):/);
const multipleFunctionTemplate = createPracticeTemplates(multipleFunctionNames, {
  python: "def sigmoid(z):\n    return z\n\ndef fit_q1(X, y, lr, n_iters):\n    return None\n\ndef predict_q1(X, model, threshold=0.5):\n    return []",
  cpp: "double sigmoid(double z) { return z; }\nauto fit_q1(vector<vector<double>> X, vector<int> y) { return 0; }",
});
assert.match(multipleFunctionTemplate["Python 3"], /def sigmoid\(z\):[\s\S]*def fit_q1\(X, y, lr, n_iters\):[\s\S]*def predict_q1\(X, model, threshold=0\.5\):/);
assert.doesNotMatch(multipleFunctionTemplate["Python 3"], /return z|return None|return \[\]/);
assert.match(multipleFunctionTemplate["C++"], /auto sigmoid\(double z\)/);
assert.match(multipleFunctionTemplate["C++"], /auto fit_q1\(vector<vector<double>> X, vector<int> y\)/);

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

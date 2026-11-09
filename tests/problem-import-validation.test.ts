import assert from "node:assert/strict";
import { normalizeInterviewImportPayload } from "../lib/interview-import-schema";
import { classifyImportedCode, validateProblemImportSemantics } from "../lib/problem-import-validation";

const languageFixtures = [
  ["python", "def solve(nums):\n    return len(nums)"],
  ["java", "class Solution { int solve(int[] nums) { return nums.length; } }"],
  ["cpp", "#include <vector>\nint solve(std::vector<int>& nums) { return nums.size(); }"],
  ["javascript", "const solve = (nums) => nums.length;"],
  ["sql", "SELECT COUNT(*) FROM values_table;"],
] as const;

for (const [language, code] of languageFixtures) {
  const classification = classifyImportedCode(code);
  assert.equal(classification.language, language);
  assert.notEqual(classification.confidence, "low");
}

const unknown = classifyImportedCode("BEGIN CUSTOM PROGRAM\nRUN TASK\nEND CUSTOM PROGRAM");
assert.equal(unknown.language, undefined);
assert.equal(unknown.confidence, "low");

const payload = normalizeInterviewImportPayload({
  title: "Validate Import",
  company: "Example",
  problemDescription: "Return the number of values.",
  examples: [
    { input: "nums = [1]", output: "", explanation: "Missing output." },
    { input: "nums = [1]", output: "", explanation: "Duplicate." },
  ],
  functionDescription: {
    functionName: "countValues",
    parameters: [{ name: "nums", type: "int[]", description: "Values" }],
  },
  solution: { python: "def solve(values):\n    return len(values" },
  complexity: { time: "O(n)\nAI Analysis: leaked", space: "O(1)" },
}, { alignFunctionNames: false });

const issues = validateProblemImportSemantics(payload);
assert.equal(issues.some((issue) => issue.code === "example-output-missing" && issue.severity === "error"), true);
assert.equal(issues.some((issue) => issue.code === "example-duplicate"), true);
assert.equal(issues.some((issue) => issue.code === "function-name-conflict"), true);
assert.equal(issues.some((issue) => issue.code === "solution-syntax-delimiter"), true);
assert.equal(issues.some((issue) => issue.code === "time-complexity-bleed"), true);

const parameterMismatch = normalizeInterviewImportPayload({
  title: "Parameter Check",
  company: "Example",
  problemDescription: "Return a value.",
  functionDescription: {
    functionName: "countValues",
    parameters: [{ name: "nums", type: "int[]", description: "Values" }],
  },
  solution: { python: "def countValues(values):\n    return len(values)" },
}, { alignFunctionNames: false });
assert.equal(validateProblemImportSemantics(parameterMismatch).some((issue) => issue.code === "function-parameters-conflict"), true);

console.log("problem import semantic validation tests passed");

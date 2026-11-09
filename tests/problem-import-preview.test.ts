import assert from "node:assert/strict";
import { parseProblemImportText } from "../lib/problem-content-import";
import { buildProblemImportPreview } from "../lib/problem-import-preview";

const raw = `Title: Safer Import
Company: Example
Difficulty: Expert
Stage: Phone Screen
Problem Description: Return the number of values.
Function Name: countValues
Python Solution:
\`\`\`python
def solve(nums):
    return len(nums)
\`\`\``;

const preview = buildProblemImportPreview(raw, parseProblemImportText(raw));
assert.equal(preview.candidates.some((candidate) => candidate.key === "difficulty"), false);
assert.equal(preview.candidates.some((candidate) => candidate.key === "stage"), false);
assert.equal(preview.warnings.some((warning) => warning.includes("Unknown difficulty")), true);
assert.equal(preview.warnings.some((warning) => warning.includes("Unknown interview type")), true);
assert.equal(preview.warnings.some((warning) => warning.includes("Code was left unchanged")), true);
assert.equal(preview.candidates.find((candidate) => candidate.key === "functionName")?.confidence, "low");
assert.equal(preview.candidates.find((candidate) => candidate.key === "solutionPython")?.confidence, "low");

const title = preview.candidates.find((candidate) => candidate.key === "title");
assert.equal(title?.confidence, "high");
assert.equal(title?.source, "Explicit label");
assert.equal(title?.sourceLine, 1);

const inferredTitleRaw = `# Inferred Title
## Problem Description
Describe the task.`;
const inferredPreview = buildProblemImportPreview(inferredTitleRaw, parseProblemImportText(inferredTitleRaw));
assert.equal(inferredPreview.candidates.find((candidate) => candidate.key === "title")?.confidence, "medium");

const jsonMismatch = `{"title":"JSON Import","company":"Example","problemDescription":"Return a value.","functionDescription":{"functionName":"expectedName"},"solution":{"python":"def solve():\\n    return 1"}}`;
const parsedJsonMismatch = parseProblemImportText(jsonMismatch);
assert.match(parsedJsonMismatch.solution.python, /def solve\(/);
assert.equal(buildProblemImportPreview(jsonMismatch, parsedJsonMismatch).warnings.some((warning) => warning.includes("Code was left unchanged")), true);

console.log("problem import preview tests passed");

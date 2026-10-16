import assert from "node:assert/strict";
import { normalizeInterviewImportPayload, toLegacyImportQuestion, validateInterviewImportPayload } from "../lib/interview-import-schema";

const googleDraft = normalizeInterviewImportPayload({
  title: "Google - K Smallest Pairs From Two Arrays",
  company: "Google",
  role: "Software Engineer",
  difficulty: "Medium",
  stage: "Coding Interview",
  category: ["Algorithms", "Data Structure"],
  topics: ["Heap", "Two Pointers"],
  problemDescription: "Given two sorted arrays, return the k pairs with the smallest sums.",
  examples: [{ input: "nums1 = [1,7,11], nums2 = [2,4,6], k = 3", output: "[[1,2],[1,4],[1,6]]", explanation: "These pairs have the smallest sums." }],
  functionDescription: { functionName: "kSmallestPairs", parameters: [{ name: "nums1", type: "number[]", description: "First sorted array" }], returnDescription: "Return the k smallest pairs." },
  constraints: ["1 <= k <= 1000"],
  approach: { coreIdea: "Use a min heap.", algorithmSteps: "Expand the smallest frontier pair.", whyWorks: "Sorted input preserves frontier order.", edgeCases: "Empty arrays." },
  solution: { python: "def k_smallest_pairs():\n    return []", java: "class Solution {}", cpp: "class Solution {};" },
  complexity: { time: "O(k log k)", space: "O(k)" },
  aiAnalysis: { interviewIntent: "Heap search", keyConcepts: "Min heap", commonMistakes: "Enumerating all pairs", followUpQuestions: "Can this stream?", betterStrategy: "Explain the invariant first." },
});

const serialized = JSON.stringify(googleDraft);
const savedPayload = normalizeInterviewImportPayload(JSON.parse(serialized));
const legacyPayload = toLegacyImportQuestion(savedPayload);
const validation = validateInterviewImportPayload(savedPayload);

assert.deepEqual(savedPayload, googleDraft);
assert.equal(validation.valid, true);
assert.equal(legacyPayload.title, googleDraft.title);
assert.equal(legacyPayload.solutionPython, googleDraft.solution.python);
assert.equal(legacyPayload.functionName, googleDraft.functionDescription.functionName);
assert.equal(legacyPayload.examples.length, 1);

console.log("Interview Draft Review payload round-trip passed.");

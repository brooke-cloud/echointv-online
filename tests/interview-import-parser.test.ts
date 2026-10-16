import assert from 'node:assert/strict';
import { parseNotionInterviewQuestion } from '../lib/interview-import-parser';
import { validateInterviewImportPayload } from '../lib/interview-import-schema';
import type { NotionContentBlock, NotionInterviewSource } from '../lib/notion-interviews';

let sequence = 0;
const block = (type: string, text: string, language?: string): NotionContentBlock => ({ id: `block-${++sequence}`, type, text, language, depth: 0 });

const source: NotionInterviewSource = {
  pageId: 'google-k-smallest-pairs',
  title: 'Google - K Smallest Pairs From Two Arrays',
  company: 'Google',
  date: '2026-10-13',
  blocks: [
    block('heading_2', 'Role'), block('paragraph', 'Software Engineer'),
    block('heading_2', 'Difficulty'), block('paragraph', 'Medium'),
    block('heading_2', 'Stage'), block('paragraph', 'Coding Interview'),
    block('heading_2', 'Category'), block('paragraph', 'Algorithms, Data Structure'),
    block('heading_2', 'Topics'), block('paragraph', 'Heap, Two Pointers'),
    block('heading_2', 'Problem Description'), block('paragraph', 'Given two sorted arrays, return the k pairs with the smallest sums.'),
    block('heading_2', 'Examples'), block('paragraph', 'Example 1:\nInput: nums1 = [1,7,11], nums2 = [2,4,6], k = 3\nOutput: [[1,2],[1,4],[1,6]]\nExplanation: These are the three pairs with the smallest sums.'),
    block('heading_2', 'Function Description'), block('paragraph', 'Function Name: kSmallestPairs\nParameters:\n- nums1 | number[] | First sorted array\n- nums2 | number[] | Second sorted array\n- k | number | Number of pairs\nReturn Description: The k pairs with the smallest sums.'),
    block('heading_2', 'Constraints'), block('bulleted_list_item', '1 <= nums1.length, nums2.length <= 100000'), block('bulleted_list_item', '1 <= k <= 1000'),
    block('heading_2', 'Approach'), block('paragraph', 'Core Idea: Use a min heap to explore the next smallest pair.\nAlgorithm Steps: Seed the heap and repeatedly pop the smallest sum.\nWhy This Works: The sorted arrays preserve the frontier ordering.\nEdge Cases: Empty input and k larger than the pair count.'),
    block('heading_2', 'Python Solution'), block('code', 'def k_smallest_pairs(nums1, nums2, k):\n    return []', 'python'),
    block('heading_2', 'Java Solution'), block('code', 'List<int[]> kSmallestPairs(int[] a, int[] b, int k) { return List.of(); }', 'java'),
    block('heading_2', 'C++ Solution'), block('code', 'vector<vector<int>> kSmallestPairs(vector<int>& a, vector<int>& b, int k) { return {}; }', 'c++'),
    block('heading_2', 'Complexity'), block('paragraph', 'Time Complexity: O(k log k)\nSpace Complexity: O(k)'),
    block('heading_2', 'AI Analysis'), block('paragraph', 'Interview Intent: Test heap-based search.\nKey Concepts: Min heap and sorted arrays.\nCommon Mistakes: Generating every pair.\nFollow Up Questions: How would you stream the result?\nBetter Strategy: Explain the frontier invariant first.'),
  ],
};

const result = parseNotionInterviewQuestion(source);
const validation = validateInterviewImportPayload(result);

assert.equal(result.title, source.title);
assert.equal(result.company, 'Google');
assert.equal(result.role, 'Software Engineer');
assert.equal(result.difficulty, 'Medium');
assert.equal(result.stage, 'Coding Interview');
assert.deepEqual(result.category, ['Algorithms', 'Data Structure']);
assert.deepEqual(result.topics, ['Heap', 'Two Pointers']);
assert.ok(result.problemDescription);
assert.equal(result.examples.length, 1);
assert.equal(result.functionDescription.functionName, 'kSmallestPairs');
assert.equal(result.functionDescription.parameters.length, 3);
assert.equal(result.constraints.length, 2);
assert.ok(result.approach.coreIdea);
assert.ok(result.approach.algorithmSteps);
assert.ok(result.approach.whyWorks);
assert.ok(result.approach.edgeCases);
assert.ok(result.solution.python);
assert.ok(result.solution.java);
assert.ok(result.solution.cpp);
assert.equal(result.complexity.time, 'O(k log k)');
assert.equal(result.complexity.space, 'O(k)');
assert.ok(result.aiAnalysis.interviewIntent);
assert.ok(result.aiAnalysis.keyConcepts);
assert.ok(result.aiAnalysis.commonMistakes);
assert.ok(result.aiAnalysis.followUpQuestions);
assert.ok(result.aiAnalysis.betterStrategy);
assert.equal(validation.valid, true);

const colonParameterResult = parseNotionInterviewQuestion({
  pageId: 'google-k-pairs', title: 'K Smallest Pairs From Two Arrays', company: 'Google', date: '2026-10-13',
  blocks: [
    block('heading_2', 'Problem Description'), block('paragraph', 'Return the k pairs with the smallest sums.'),
    block('heading_2', 'Function Description'),
    block('paragraph', 'Function Name:\nkSmallestPairs\n\nParameters:\nnums1: integer array - first sorted array\nnums2: integer array - second sorted array\nk: integer - number of pairs to return\n\nReturn Description:\nReturn a list of k pairs.'),
  ],
});
assert.deepEqual(colonParameterResult.functionDescription.parameters, [
  { name: 'nums1', type: 'integer array', description: 'first sorted array' },
  { name: 'nums2', type: 'integer array', description: 'second sorted array' },
  { name: 'k', type: 'integer', description: 'number of pairs to return' },
]);

const minimal = parseNotionInterviewQuestion({
  pageId: 'minimal',
  title: 'Minimal Coding Question',
  company: 'Meta',
  date: '',
  blocks: [block('heading_2', 'Problem'), block('paragraph', 'Return the input value.')],
});
const minimalValidation = validateInterviewImportPayload(minimal);
assert.equal(minimalValidation.valid, true);
assert.ok(minimalValidation.missingFields.includes('Examples'));
assert.ok(minimalValidation.missingFields.includes('Solution'));

console.log('Interview import parser fixture passed.');

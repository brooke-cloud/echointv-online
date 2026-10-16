import assert from "node:assert/strict";
import { parseProblemImportText } from "../lib/problem-content-import";

const markdown = `# 1. Basic Information

**Title:** K Smallest Pairs From Two Arrays
**Company:** Google

# 3. Examples

### Example 1

**Input**
\`\`\`text
nums1 = [1, 7, 11]
nums2 = [2, 4, 6]
k = 3
\`\`\`

**Output**
\`\`\`text
[[1, 2], [1, 4], [1, 6]]
\`\`\`

**Explanation**
These are the three pairs with the smallest sums.

# 5. Constraints

\`\`\`text
1 <= nums1.length, nums2.length <= 10^5
-10^9 <= nums1[i], nums2[j] <= 10^9
1 <= k <= 10^4
\`\`\`
`;

const parsed = parseProblemImportText(markdown);

assert.deepEqual(parsed.examples, [{
  input: "nums1 = [1, 7, 11]\nnums2 = [2, 4, 6]\nk = 3",
  output: "[[1, 2], [1, 4], [1, 6]]",
  explanation: "These are the three pairs with the smallest sums.",
}]);
assert.deepEqual(parsed.constraints, [
  "1 <= nums1.length, nums2.length <= 10^5",
  "-10^9 <= nums1[i], nums2[j] <= 10^9",
  "1 <= k <= 10^4",
]);

const standaloneLabels = `# 3. Examples

Example 1

Input

\`\`\`text
nums1 = [1, 7, 11]
k = 3
\`\`\`

Output

\`\`\`text
[[1, 2], [1, 4], [1, 6]]
\`\`\`

Explanation

The three pairs have the smallest sums.

# 4. Function Description

Function Name

kSmallestPairs

Parameters

NAME: nums1
TYPE: List[int]
DESCRIPTION: The first sorted integer array.

NAME: nums2
TYPE: List[int]
DESCRIPTION: The second sorted integer array.

NAME: k
TYPE: int
DESCRIPTION: The maximum number of pairs to return.

Return

DESCRIPTION

Return up to k pairs.
`;

const standaloneParsed = parseProblemImportText(standaloneLabels);
assert.deepEqual(standaloneParsed.examples, [{
  input: "nums1 = [1, 7, 11]\nk = 3",
  output: "[[1, 2], [1, 4], [1, 6]]",
  explanation: "The three pairs have the smallest sums.",
}]);
assert.deepEqual(standaloneParsed.functionDescription.parameters, [
  { name: "nums1", type: "List[int]", description: "The first sorted integer array." },
  { name: "nums2", type: "List[int]", description: "The second sorted integer array." },
  { name: "k", type: "int", description: "The maximum number of pairs to return." },
]);
assert.equal(standaloneParsed.functionDescription.returnDescription, "Return up to k pairs.");

console.log("problem-content-import tests passed");

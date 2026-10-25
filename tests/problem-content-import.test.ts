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

const boundedSections = parseProblemImportText(`# 3. Examples
Example 1
Input
s = "aab"
Output
"aba"
Explanation
The characters can be rearranged.

## Function Description
### Function Name
reorganizeString

## Step-by-step Approach
Use a frequency map and always choose the most frequent valid character.

## Solutions
### Python
\`\`\`python
def reorganizeString(s):
    return s
\`\`\``);
assert.equal(boundedSections.examples[0].explanation, "The characters can be rearranged.");
assert.equal(boundedSections.examples[0].explanation.includes("Function Description"), false);
assert.equal(boundedSections.approach.algorithmSteps, "Use a frequency map and always choose the most frequent valid character.");
assert.equal(boundedSections.approach.algorithmSteps.includes("Solutions"), false);
assert.equal(boundedSections.solution.python, "def reorganizeString(s):\n    return s");

const boldFunctionBoundary = parseProblemImportText(`# 3. Examples
Example 1
Input
pizzas = 2
Output
total = 27
Explanation
The subtotal is 27.
The final total is also 27.

**Function Description**
**Function Name:** calculateTotal`);
assert.equal(boldFunctionBoundary.examples[0].explanation, "The subtotal is 27.\nThe final total is also 27.");
assert.equal(boldFunctionBoundary.examples[0].explanation.includes("Function Description"), false);

const flattenedPython = parseProblemImportText(`## Solutions
### Python
class LogStreamProcessor:        def __init__(self):            self.user_partners = {}        def add_interaction(self, sender_username, receiver_username):            self.user_partners[sender_username] = receiver_username        return True`);
assert.equal(flattenedPython.solution.python, "class LogStreamProcessor:\n        def __init__(self):\n            self.user_partners = {}\n        def add_interaction(self, sender_username, receiver_username):\n            self.user_partners[sender_username] = receiver_username\n        return True");

const flattenedPythonWithComments = parseProblemImportText(`Solutions
Python
\`\`\`
class Solution:    # Find the answer.    def solve(self, nums: list[int]) -> int:        # Store the running total.        total = 0        # Add every value.        for value in nums:            total += value        # Return the result.        return total# Create a solution instance.solution = Solution()# Define sample values.nums = [1, 2]# Calculate and print.print(solution.solve(nums))
\`\`\``);
assert.equal(flattenedPythonWithComments.solution.python, `class Solution:
    # Find the answer.
    def solve(self, nums: list[int]) -> int:
        # Store the running total.
        total = 0
        # Add every value.
        for value in nums:
            total += value
        # Return the result.
        return total`);

const copiedRenderedCodeBlocks = parseProblemImportText(`Solutions

\`\`\`
Python
\`\`\`
from bisect import bisect_left        def find_target(values, target):            index = bisect_left(values, target)            return index# Create sample values.values = [1, 3, 5]# Print the answer.print(find_target(values, 3))

\`\`\`
C++
\`\`\`
#include <algorithm>
#include <vector>
using namespace std;

int findTarget(vector<int> values, int target) {
    return lower_bound(values.begin(), values.end(), target) - values.begin();
}
\`\`\``);
assert.equal(copiedRenderedCodeBlocks.solution.python, `from bisect import bisect_left
        def find_target(values, target):
            index = bisect_left(values, target)
            return index`);
assert.equal(copiedRenderedCodeBlocks.solution.python.includes("C++"), false);
assert.equal(copiedRenderedCodeBlocks.solution.cpp.includes("#include <algorithm>"), true);
assert.equal(copiedRenderedCodeBlocks.solution.cpp.includes("Python"), false);

const escapedPython = parseProblemImportText(`Python Solution: class Solver:\\n    def solve(self):\\n        return True`);
assert.equal(escapedPython.solution.python, "class Solver:\n    def solve(self):\n        return True");

const singleFenceWithAllLanguages = parseProblemImportText(`## Solutions
\`\`\`
### Python
def solve(nums):
    return len(nums)

### Java
public class Solution {
    public int solve(int[] nums) { return nums.length; }
}

### C++
#include <vector>
using namespace std;
int solve(vector<int> nums) { return nums.size(); }
\`\`\``);
assert.equal(singleFenceWithAllLanguages.solution.python.includes("def solve"), true);
assert.equal(singleFenceWithAllLanguages.solution.python.includes("public class"), false);
assert.equal(singleFenceWithAllLanguages.solution.java.includes("public class Solution"), true);
assert.equal(singleFenceWithAllLanguages.solution.java.includes("#include"), false);
assert.equal(singleFenceWithAllLanguages.solution.cpp.includes("#include <vector>"), true);

const inferredUnlabelledLanguages = parseProblemImportText(`## Solutions
\`\`\`
import java.util.List;
public class Solution { public int solve(List<Integer> nums) { return nums.size(); } }
\`\`\`

\`\`\`
#include <vector>
using namespace std;
int solve(vector<int> nums) { return nums.size(); }
\`\`\``);
assert.equal(inferredUnlabelledLanguages.solution.java.includes("import java.util.List"), true);
assert.equal(inferredUnlabelledLanguages.solution.cpp.includes("#include <vector>"), true);

const plainFunctionBoundary = parseProblemImportText(`# 3. Examples
Example 1
Input
tree one
Output
2
Explanation
First explanation.

Example 2
Input
tree two
Output
1
Explanation
Second explanation.

Example 3
Input
tree three
Output
2
Explanation
Third explanation stays here.

Function Description
Function Name
countIslands
Parameters
root | TreeNode | Root node`);
assert.equal(plainFunctionBoundary.examples.length, 3);
assert.equal(plainFunctionBoundary.examples[2].explanation, "Third explanation stays here.");
assert.equal(plainFunctionBoundary.examples[2].explanation.includes("Function Description"), false);

const indentedTree = parseProblemImportText(`# 3. Examples
Example 1
Input
    1
   / \\
  2   3
Output
    6
Explanation
The tree indentation must be preserved.`);
assert.equal(indentedTree.examples[0].input, "    1\n   / \\\n  2   3");
assert.equal(indentedTree.examples[0].output, "    6");

const tableParsed = parseProblemImportText(`# 4. Function Description
Function Name: sigmoid, fit_q1, predict_q1

Parameters
| NAME | TYPE | DESCRIPTION |
| --- | --- | --- |
| X | float[][] / List[List[float]] | Feature matrix containing training or prediction samples |
| y | int[] / List[int] | Class labels corresponding to training samples |
| lr | float | Learning rate used by logistic regression |
`);
assert.deepEqual(tableParsed.functionDescription.parameters, [
  { name: "X", type: "float[][] / List[List[float]]", description: "Feature matrix containing training or prediction samples" },
  { name: "y", type: "int[] / List[int]", description: "Class labels corresponding to training samples" },
  { name: "lr", type: "float", description: "Learning rate used by logistic regression" },
]);

const plainAiAnalysisBoundary = parseProblemImportText(`Complexity

Time Complexity

O(n log n) Sorting the events dominates the running time.

Space Complexity

O(n) The event list stores two events per interval.

AI Analysis

Interview Focus

This problem evaluates sweep-line reasoning and tie-breaking.

Key Concepts

Sweep Line Algorithm
Event Sorting`);
assert.equal(plainAiAnalysisBoundary.complexity.time, "O(n log n) Sorting the events dominates the running time.");
assert.equal(plainAiAnalysisBoundary.complexity.space, "O(n) The event list stores two events per interval.");
assert.equal(plainAiAnalysisBoundary.complexity.time.includes("AI Analysis"), false);
assert.equal(plainAiAnalysisBoundary.complexity.space.includes("AI Analysis"), false);
assert.equal(plainAiAnalysisBoundary.aiAnalysis.interviewIntent, "This problem evaluates sweep-line reasoning and tie-breaking.");
assert.equal(plainAiAnalysisBoundary.aiAnalysis.keyConcepts, "Sweep Line Algorithm\nEvent Sorting");

console.log("problem-content-import tests passed");

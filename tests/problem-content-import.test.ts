import assert from "node:assert/strict";
import { buildProblemImportFeedback, parseProblemImportText, parseProblemImportTextWithDiagnostics } from "../lib/problem-content-import";

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

const boldNumberedExamples = parseProblemImportText(`\u793a\u4f8b\uFF1A
**Example**

**Example 1**

Input:

\`\`\`python
intervals = [[9, 10], [9, 11], [10, 12], [11, 13]]
\`\`\`

Output:

\`\`\`python
2
\`\`\`

Explanation\uFF1A

The meetings \`[9, 10]\` and \`[9, 11]\` overlap, so they require two separate rooms.

Therefore, a minimum of two conference rooms is sufficient.

**Example 2**

Input:

\`\`\`python
intervals = [[0, 30], [5, 10], [15, 20]]
\`\`\`

Output:

\`\`\`python
2
\`\`\`

Explanation\uFF1A

The long meeting overlaps with both shorter meetings. Therefore, two rooms are sufficient.

**Example 3**

Input:

\`\`\`python
intervals = [[7, 10], [10, 12]]
\`\`\`

Output:

\`\`\`python
1
\`\`\`

Explanation\uFF1A

The first meeting ends exactly when the second starts, so one room is required.`);
assert.deepEqual(boldNumberedExamples.examples, [
  { input: "intervals = [[9, 10], [9, 11], [10, 12], [11, 13]]", output: "2", explanation: "The meetings `[9, 10]` and `[9, 11]` overlap, so they require two separate rooms.\nTherefore, a minimum of two conference rooms is sufficient." },
  { input: "intervals = [[0, 30], [5, 10], [15, 20]]", output: "2", explanation: "The long meeting overlaps with both shorter meetings. Therefore, two rooms are sufficient." },
  { input: "intervals = [[7, 10], [10, 12]]", output: "1", explanation: "The first meeting ends exactly when the second starts, so one room is required." },
]);

const inlineExamples = parseProblemImportText(`# Examples
## Example 1
Input: nums = [1, 2]
Output: 3
Explanation: Add both values.

## Example 2
**Input:** nums = [4, 5]
**Output：** 9
**Explanation:** Add the second pair.`);
assert.deepEqual(inlineExamples.examples, [
  { input: "nums = [1, 2]", output: "3", explanation: "Add both values." },
  { input: "nums = [4, 5]", output: "9", explanation: "Add the second pair." },
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
assert.equal(standaloneParsed.functionDescription.functionName, "kSmallestPairs");

for (const functionNameBlock of [
  "**Function Name:**\nmaxDistance(grid)",
  "**Function Name：**\nmaxDistance(grid)",
  "**Function Name**: maxDistance(grid)",
  "Function Name: maxDistance(grid)",
]) {
  const parsedFunctionName = parseProblemImportText(`**Function Description**\n\n${functionNameBlock}\n\n**Parameters**`);
  assert.equal(parsedFunctionName.functionDescription.functionName, "maxDistance(grid)");
}

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

const genericJavaSolution = parseProblemImportText(`# Solution
public class Solution {
    public int solve(int[] nums) { return nums.length; }
}`);
assert.equal(genericJavaSolution.solution.python, "");
assert.equal(genericJavaSolution.solution.java.includes("public class Solution"), true);

const genericCppSolution = parseProblemImportText(`# Solution
#include <vector>
using namespace std;
int solve(vector<int> nums) { return nums.size(); }`);
assert.equal(genericCppSolution.solution.python, "");
assert.equal(genericCppSolution.solution.cpp.includes("#include <vector>"), true);

const unrelatedImport = parseProblemImportTextWithDiagnostics("This is unrelated prose without supported labels.");
assert.equal(unrelatedImport.payload.title, "");
assert.deepEqual(unrelatedImport.diagnostics.recognizedFields, []);
assert.equal(unrelatedImport.diagnostics.warnings.some((warning) => warning.includes("No supported section")), true);
const unrelatedFeedback = buildProblemImportFeedback(unrelatedImport.diagnostics);
assert.equal(unrelatedFeedback.tone, "error");
assert.equal(unrelatedFeedback.message.startsWith("Import complete"), false);

const diagnosticImport = parseProblemImportTextWithDiagnostics(`Title: Sum Values
Company: Google
Examples
Example 1
Input: nums = [1, 2]
Output: 3
Explanation: Add both values.`);
assert.equal(diagnosticImport.diagnostics.recognizedFields.includes("Title"), true);
assert.equal(diagnosticImport.diagnostics.recognizedFields.includes("Function Name"), false);
assert.equal(diagnosticImport.diagnostics.missingFields.includes("Function Description"), true);
assert.deepEqual(diagnosticImport.diagnostics.recognizedFields, [
  "Title",
  "Company",
  "Example 1 Input",
  "Example 1 Output",
  "Example 1 Explanation",
]);
assert.equal(diagnosticImport.diagnostics.recognizedFields.length, 5);
assert.deepEqual(diagnosticImport.diagnostics.missingFields, [
  "Problem Description",
  "Role",
  "Difficulty",
  "Stage",
  "Category",
  "Topics",
  "Function Description",
  "Constraints",
  "Approach",
  "Solution",
  "Complexity",
  "AI Analysis",
]);
const partialFeedback = buildProblemImportFeedback(diagnosticImport.diagnostics);
assert.equal(partialFeedback.tone, "warning");
assert.equal(partialFeedback.message.includes("5 source fields were recognized"), true);
assert.equal(partialFeedback.message.includes("Missing: Problem Description"), true);

const tildeFences = parseProblemImportText(`# Examples
## Example 1
Input
~~~text
nums = [1, 2]
~~~
Output
~~~text
3
~~~
Explanation
Sum the values.

# Solutions
## C++
~~~cpp
#include <vector>
using namespace std;
int solve(vector<int> nums) { return nums.size(); }
~~~`);
assert.deepEqual(tildeFences.examples, [{ input: "nums = [1, 2]", output: "3", explanation: "Sum the values." }]);
assert.equal(tildeFences.solution.cpp.includes("#include <vector>"), true);
assert.equal(tildeFences.solution.cpp.includes("~~~"), false);

const fencedJsonImport = parseProblemImportTextWithDiagnostics(`~~~json
{
  "title": "Two Sum",
  "company": "Google",
  "problemDescription": "Return two matching indices."
}
~~~`);
assert.equal(fencedJsonImport.payload.title, "Two Sum");
assert.equal(fencedJsonImport.payload.company, "Google");
assert.equal(fencedJsonImport.payload.problemDescription, "Return two matching indices.");
assert.equal(fencedJsonImport.diagnostics.recognizedFields.includes("Title"), true);

const recoveredFence = parseProblemImportTextWithDiagnostics(`# Examples
## Example 1
Input
\`\`\`text
nums = [1]
Output
1
Explanation
Only one value.

## Function Description
### Function Name
singleValue

## Constraints
- nums has one value.`);
assert.equal(recoveredFence.payload.functionDescription.functionName, "singleValue");
assert.deepEqual(recoveredFence.payload.constraints, ["nums has one value."]);
assert.equal(recoveredFence.diagnostics.warnings.some((warning) => warning.includes("Unclosed code fence")), true);

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

const boldHeaderTable = parseProblemImportText(`# Function Description
Parameters
| **Name** | **Type** | **Description** |
| --- | --- | --- |
| nums | List[int] | Input values. |
| k | int | Number of values. |`);
assert.deepEqual(boldHeaderTable.functionDescription.parameters, [
  { name: "nums", type: "List[int]", description: "Input values." },
  { name: "k", type: "int", description: "Number of values." },
]);
assert.equal(boldHeaderTable.functionDescription.parameters.some((parameter) => parameter.name.includes("Name")), false);

for (const [source, expectedName] of [
  [`# Python Solution
\`\`\`python
class Solution:
    def maxDistance(self, grid):
        return 0
\`\`\``, "maxDistance"],
  [`# Java Solution
\`\`\`java
public class Solution {
    public int maxDistance(int[][] grid) { return 0; }
}
\`\`\``, "maxDistance"],
  [`# C++ Solution
\`\`\`cpp
class Solution {
public:
    int maxDistance(vector<vector<int>>& grid) { return 0; }
};
\`\`\``, "maxDistance"],
] as const) {
  const inferredFunction = parseProblemImportTextWithDiagnostics(source);
  assert.equal(inferredFunction.payload.functionDescription.functionName, expectedName);
  assert.equal(inferredFunction.diagnostics.recognizedFields.includes("Function Name"), true);
}

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

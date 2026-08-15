export type Problem = {
  id: number;
  title: string;
  company: string;
  role: string;
  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
  description: string;
  example: string;
  approach: string;
  solution: string;
  timeComplexity: string;
  spaceComplexity: string;
  topics: string[];
};

export const problems: Problem[] = [
{
  id: 1,
  title: "Two Sum Variant",
  company: "Amazon",
  role: "Software Engineer",
  difficulty: "Easy",
  category: "Array / Hash Map",
  description:
    "Given an array of integers and a target value, find two numbers whose sum equals the target.",
  example: `
Input:
nums = [2, 7, 11, 15]
target = 9

Output:
[0, 1]
  `,
  approach:
    "Use a hash map to store numbers that have already been visited. For every number, calculate target - currentNumber and check whether that value already exists in the hash map.",
  solution: `
def two_sum(nums, target):
    seen = {}

    for i, num in enumerate(nums):
        complement = target - num

        if complement in seen:
            return [seen[complement], i]

        seen[num] = i

    return []
  `,
  timeComplexity: "O(n)",
  spaceComplexity: "O(n)",
  topics: ["Array", "Hash Map"],
},

  {
    id: 2,
    title: "Merge Intervals Follow-up",
    company: "Meta",
    role: "Software Engineer",
    difficulty: "Medium",
    category: "Array / Intervals",
    description:
      "Given two sorted interval lists with no overlapping intervals inside each list, merge them into one sorted non-overlapping list.",
    example: `
Input:
intervals1 = [[1,3],[6,9]]
intervals2 = [[2,5],[10,12]]

Output:
[[1,5],[6,9],[10,12]]
    `,
    approach:
      "First merge the two sorted interval lists using two pointers. Then perform the standard merge-interval process on the combined sorted list.",
    solution: `
def merge_intervals(intervals1, intervals2):
    merged = []
    i = 0
    j = 0

    while i < len(intervals1) and j < len(intervals2):
        if intervals1[i][0] < intervals2[j][0]:
            merged.append(intervals1[i])
            i += 1
        else:
            merged.append(intervals2[j])
            j += 1

    merged.extend(intervals1[i:])
    merged.extend(intervals2[j:])

    result = []

    for interval in merged:
        if not result or result[-1][1] < interval[0]:
            result.append(interval)
        else:
            result[-1][1] = max(result[-1][1], interval[1])

    return result
    `,
    timeComplexity: "O(n + m)",
    spaceComplexity: "O(n + m)",
    topics: ["Array", "Intervals", "Two Pointers"],
  },

  {
    id: 3,
    title: "Design a URL Shortener",
    company: "Google",
    role: "Backend Engineer",
    difficulty: "Hard",
    category: "System Design",
    description:
      "Design a scalable URL shortening service similar to Bitly or TinyURL.",
    example: `
Input:
https://example.com/very/long/url

Output:
https://short.ly/abc123
    `,
    approach:
      "Design an API for creating and resolving short URLs. Store short-code mappings in a database and add caching for frequently accessed URLs.",
    solution: `
Core components:

1. API Gateway
2. URL shortening service
3. Key generation service
4. Database
5. Redis cache
6. Load balancer
    `,
    timeComplexity: "O(1) for get and put",
    spaceComplexity: "O(capacity)",
    topics: ["Hash Map", "Linked List", "Design"],
  },

  {
    id: 4,
    title: "LRU Cache",
    company: "Amazon",
    role: "Software Engineer",
    difficulty: "Medium",
    category: "Hash Map / Linked List",
    description:
      "Design a data structure that supports get and put operations in O(1) time.",
    example: `
put(1, 10)
put(2, 20)

get(1) -> 10

put(3, 30)

get(2) -> -1
    `,
    approach:
      "Use a hash map for O(1) lookup and a doubly linked list for O(1) insertion and removal.",
    solution: `
Use:

HashMap:
key -> node

Doubly Linked List:
most recently used <-> least recently used

Both get() and put() can therefore run in O(1).
    `,
    timeComplexity: "Depends on system design",
    spaceComplexity: "Depends on storage architecture",
    topics: ["System Design", "Database", "Cache", "Distributed Systems"],
  },
];
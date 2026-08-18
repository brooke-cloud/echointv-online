--
-- PostgreSQL database dump
--

\restrict yI3fFqHulV4ani3Xm5z7DI9tqrq2V10DNdppFHrrsisD3KhaJK4Lcwika1od0cx

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: Post; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Post" VALUES (1, 'amazon-sde-interview-experience', 'Amazon SDE Interview Experience', 'Complete breakdown of Amazon software engineer interview rounds.', '
This interview consisted of multiple technical and behavioral rounds.

The coding rounds focused on data structures, algorithms, and problem-solving communication.

Candidates should practice explaining their thought process clearly before writing code.
    ', 'Interview Experience', 'Aug 13, 2026', '6 min read', '2026-08-13 13:23:46.14', '2026-08-13 13:23:46.14');
INSERT INTO public."Post" VALUES (2, 'leetcode-dynamic-programming-guide', 'Leetcode Dynamic Programming Guide', 'How to prepare dynamic programming problems for coding interviews.', '
Dynamic programming is one of the most important topics in coding interviews.

The key is learning how to identify overlapping subproblems and optimal substructure.

Start with simple one-dimensional DP before moving to more complex problems.
    ', 'Coding', 'Aug 10, 2026', '8 min read', '2026-08-13 13:23:46.142', '2026-08-13 13:23:46.142');
INSERT INTO public."Post" VALUES (3, 'system-design-for-new-grad', 'System Design Guide for New Grads', 'A beginner-friendly system design roadmap for software engineering interviews.', '
System design interviews evaluate how you think about scalable software systems.

New grads should first understand APIs, databases, caching, and load balancing.

Focus on explaining trade-offs instead of trying to design a perfect system.
    ', 'System Design', 'Aug 8, 2026', '7 min read', '2026-08-13 13:23:46.142', '2026-08-13 13:23:46.142');
INSERT INTO public."Post" VALUES (4, 'how-to-prepare-software-engineering-interviews', 'How to Prepare for Software Engineering Interviews', 'A practical preparation roadmap covering coding, projects, and interview communication.', '## Interview Process

The interview consisted of **three rounds**.

### Round 1: Coding

The first round focused on arrays and hash maps.

- Two Sum
- Merge Intervals
- Hash Map Design

### Round 2: System Design

We discussed how to design a scalable URL shortener.

> Always clarify requirements before starting the design.

### Example Code

```python
def two_sum(nums, target):
    seen = {}

    for index, number in enumerate(nums):
        complement = target - number

        if complement in seen:
            return [seen[complement], index]

        seen[number] = index

    return []
```

### Complexity

| Type | Complexity |
| --- | --- |
| Time | O(n) |
| Space | O(n) |

### Preparation Tips

1. Clarify the problem.
2. Explain your approach.
3. Analyze complexity.
4. Write clean code.

For more interview content, visit [FastPrep](https://example.com).', 'Career', 'Aug 5, 2026', '5 min read', '2026-08-13 13:23:46.143', '2026-08-14 08:09:05.833');
INSERT INTO public."Post" VALUES (5, 'amazon-sde-interview-experience-2026', 'Amazon SDE Interview Experience 2026', 'My complete Amazon software engineering interview experience.', '## Interview Overview

I recently completed a software engineering interview process.

The process included **three rounds**.

## Round 1: Coding

The first question was an array problem.

### My Approach

I used a hash map to reduce the lookup time.

```python
def solve(nums, target):
    seen = {}

    for i, num in enumerate(nums):
        need = target - num

        if need in seen:
            return [seen[need], i]

        seen[num] = i
```

### Complexity

| Type | Complexity |
| --- | --- |
| Time | O(n) |
| Space | O(n) |

## What I Learned

1. Explain your approach first.
2. Clarify edge cases.
3. Analyze complexity.
4. Keep communication clear.

> Writing correct code is only one part of the interview.', 'Interview Experience', 'Aug 14, 2026', '8 min read', '2026-08-14 08:14:14.033', '2026-08-14 08:14:14.033');
INSERT INTO public."Post" VALUES (6, 'meta-software-engineer-interview-experience', 'Meta Software Engineer Interview Experience', '...', '...', 'Interview Experience', 'Aug 14, 2026', '8 min read', '2026-08-14 14:34:14.352', '2026-08-14 14:37:13.301');


--
-- Data for Name: Problem; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Problem" VALUES (5, 'Two Sum Variant', 'Amazon', 'Software Engineer', 'Easy', 'Array / Hash Map', 'Given an array of integers and a target value, find two numbers whose sum equals the target.', '
Input:
nums = [2, 7, 11, 15]
target = 9

Output:
[0, 1]
  ', 'Use a hash map to store numbers that have already been visited. For every number, calculate target - currentNumber and check whether that value already exists in the hash map.', '
def two_sum(nums, target):
    seen = {}

    for i, num in enumerate(nums):
        complement = target - num

        if complement in seen:
            return [seen[complement], i]

        seen[num] = i

    return []
  ', 'O(n)', 'O(n)', '2026-08-13 13:23:46.128', '2026-08-14 08:41:04.157', '{Array,"Hash Map"}', 'two-sum-variant');
INSERT INTO public."Problem" VALUES (6, 'Merge Intervals Follow-up', 'Meta', 'Software Engineer', 'Medium', 'Array / Intervals', 'Given two sorted interval lists with no overlapping intervals inside each list, merge them into one sorted non-overlapping list.', '
Input:
intervals1 = [[1,3],[6,9]]
intervals2 = [[2,5],[10,12]]

Output:
[[1,5],[6,9],[10,12]]
    ', 'First merge the two sorted interval lists using two pointers. Then perform the standard merge-interval process on the combined sorted list.', '
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
    ', 'O(n + m)', 'O(n + m)', '2026-08-13 13:23:46.132', '2026-08-14 08:41:04.16', '{Array,Intervals,"Two Pointers"}', 'merge-intervals-follow-up');
INSERT INTO public."Problem" VALUES (7, 'Design a URL Shortener', 'Google', 'Backend Engineer', 'Hard', 'System Design', 'Design a scalable URL shortening service similar to Bitly or TinyURL.', '
Input:
https://example.com/very/long/url

Output:
https://short.ly/abc123
    ', 'Design an API for creating and resolving short URLs. Store short-code mappings in a database and add caching for frequently accessed URLs.', '
Core components:

1. API Gateway
2. URL shortening service
3. Key generation service
4. Database
5. Redis cache
6. Load balancer
    ', 'O(1) for get and put', 'O(capacity)', '2026-08-13 13:23:46.134', '2026-08-14 08:41:04.162', '{"Hash Map","Linked List",Design}', 'design-a-url-shortener');
INSERT INTO public."Problem" VALUES (8, 'LRU Cache', 'Amazon', 'Software Engineer', 'Medium', 'Hash Map / Linked List', 'Design a data structure that supports get and put operations in O(1) time.', '
put(1, 10)
put(2, 20)

get(1) -> 10

put(3, 30)

get(2) -> -1
    ', 'Use a hash map for O(1) lookup and a doubly linked list for O(1) insertion and removal.', '
Use:

HashMap:
key -> node

Doubly Linked List:
most recently used <-> least recently used

Both get() and put() can therefore run in O(1).
    ', 'Depends on system design', 'Depends on storage architecture', '2026-08-13 13:23:46.136', '2026-08-14 08:41:04.163', '{"System Design",Database,Cache,"Distributed Systems"}', 'lru-cache');
INSERT INTO public."Problem" VALUES (9, 'Binary Tree Level Order Traversal', 'Microsoft', 'Software Engineer', 'Medium', 'Tree / BFS', 'Given a binary tree, return the level order traversal of its nodes.', 'Input:
root = [3,9,20,null,null,15,7]


Output:
[[3],[9,20],[15,7]]', 'Use BFS with a queue.', 'def levelOrder(root):
    ...', 'O(n)', 'O(n)', '2026-08-14 05:50:29.487', '2026-08-14 08:41:04.165', '{}', 'binary-tree-level-order-traversal');


--
-- Name: Post_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Post_id_seq"', 6, true);


--
-- Name: Problem_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Problem_id_seq"', 9, true);


--
-- PostgreSQL database dump complete
--

\unrestrict yI3fFqHulV4ani3Xm5z7DI9tqrq2V10DNdppFHrrsisD3KhaJK4Lcwika1od0cx


// data/posts.ts

export type Post = {
  slug: string;
  title: string;
  description: string;
  content: string;
  category: string;
  date: string;
  readingTime: string;
  isFree?: boolean; // 🌟 是否免费（true: 免费, false: 付费）
};

export const posts: Post[] = [
  {
    slug: "amazon-sde-interview-experience",
    title: "Amazon SDE Interview Experience",
    description:
      "Complete breakdown of Amazon software engineer interview rounds.",
    category: "Interview Experience",
    date: "Aug 13, 2026",
    readingTime: "6 min read",
    isFree: true, // 🌟 前 5 篇免费
    content: `
This interview consisted of multiple technical and behavioral rounds.

The coding rounds focused on data structures, algorithms, and problem-solving communication.

Candidates should practice explaining their thought process clearly before writing code.
    `,
  },

  {
    slug: "leetcode-dynamic-programming-guide",
    title: "Leetcode Dynamic Programming Guide",
    description:
      "How to prepare dynamic programming problems for coding interviews.",
    category: "Coding",
    date: "Aug 10, 2026",
    readingTime: "8 min read",
    isFree: true, // 🌟 前 5 篇免费
    content: `
Dynamic programming is one of the most important topics in coding interviews.

The key is learning how to identify overlapping subproblems and optimal substructure.

Start with simple one-dimensional DP before moving to more complex problems.
    `,
  },

  {
    slug: "system-design-for-new-grad",
    title: "System Design Guide for New Grads",
    description:
      "A beginner-friendly system design roadmap for software engineering interviews.",
    category: "System Design",
    date: "Aug 8, 2026",
    readingTime: "7 min read",
    isFree: true, // 🌟 前 5 篇免费
    content: `
System design interviews evaluate how you think about scalable software systems.

New grads should first understand APIs, databases, caching, and load balancing.

Focus on explaining trade-offs instead of trying to design a perfect system.
    `,
  },

  {
    slug: "how-to-prepare-software-engineering-interviews",
    title: "How to Prepare for Software Engineering Interviews",
    description:
      "A practical preparation roadmap covering coding, projects, and interview communication.",
    category: "Career",
    date: "Aug 5, 2026",
    readingTime: "5 min read",
    isFree: true, // 🌟 前 5 篇免费
    content: `
Interview preparation should not focus only on solving coding questions.

Candidates should also practice communication, project explanations, behavioral questions, and technical fundamentals.

A structured preparation plan usually works better than randomly solving problems.
    `,
  },
];
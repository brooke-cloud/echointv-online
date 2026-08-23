// types/post.ts

export type Post = {
  id?: number;
  slug: string;
  title: string;
  description: string;
  category: string;
  date?: string;
  readingTime?: string; // 🌟 数据库字段为 readingTime
  readTime?: string;    // 兼容可能存在的历史引用
  content?: string;
  isFree?: boolean;     // 🌟 免费/付费标识
  createdAt?: Date | string;
  updatedAt?: Date | string;
};
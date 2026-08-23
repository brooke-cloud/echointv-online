export type Problem = {
  id: number;
  slug: string;
  title: string;
  company: string;
  role: string;
  difficulty: string;
  category: string;
  description: string;
  example: string;
  approach: string;
  solution: string;
  timeComplexity: string;
  spaceComplexity: string;
  topics: string[];
  stage: string; // 🌟 添加 stage 字段
  isFree?: boolean; // 🌟 新增：是否免费（true: 免费, false: 付费）
};
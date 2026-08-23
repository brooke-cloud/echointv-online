// app/(public)/blog/page.tsx

import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import BlogList from "@/components/BlogList";

export const metadata: Metadata = {
  title: "面试经验与求职攻略 | Echo INTV",
  description:
    "收录 Meta、Google、Amazon 等大厂真实面试真题还原、系统设计拆解与求职通关经验分享。",
  alternates: {
    canonical: "/blog",
  },
};

export const revalidate = 60;

export default async function BlogPage() {
  // 🌟 核心修改：改为 orderBy: { id: "asc" } 正序排列
  const rawPosts = await prisma.post.findMany({
    orderBy: {
      id: "asc",
    },
  });

  // 🌟 自动规则：前 6 篇（index 0~5）自动判定为免费，第 7 篇及以后自动判定为付费
  const posts = rawPosts.map((post, index) => ({
    ...post,
    content: post.content ?? "",
    readingTime: post.readingTime || "5 min read",
    readTime: post.readingTime || "5 min read",
    isFree: index < 6,
  }));

  return (
    <main className="min-h-screen bg-gray-50 py-16">
      <div className="mx-auto max-w-7xl px-6">
        <section>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
            面试经验
          </h1>
          <p className="mt-4 max-w-2xl text-base sm:text-lg leading-8 text-gray-600">
            收录大厂真实面试还原、算法解题套路、系统设计拆解与求职通关经验。
          </p>
        </section>

        <section className="mt-10">
          <BlogList posts={posts} />
        </section>
      </div>
    </main>
  );
}
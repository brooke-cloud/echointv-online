// app/(public)/blog/page.tsx

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import BlogList from "@/components/BlogList";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "面试经验与求职攻略 | Echo INTV",
  description: "收录大厂真实面试还原、算法解题套路、系统设计拆解与求职通关经验。",
};

export const revalidate = 60;

export default async function BlogPage() {
  // 按最早发布正序排列（保证最底部的文章为前 6 篇免费）
  const rawPosts = await prisma.post.findMany({
    orderBy: {
      id: "asc",
    },
  });

  // 🌟 核心修复：处理 company 与 content 的 null 兼容
  const posts = rawPosts.map((post, index) => ({
    ...post,
    company: post.company || undefined,
    content: post.content ?? "",
    readingTime: post.readingTime || "5 min read",
    isFree: index < 6,
  }));

  return (
    <main className="min-h-screen bg-gray-50/50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <section className="space-y-3">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            面试经验
          </h1>
          <p className="text-base text-gray-500 max-w-3xl leading-relaxed">
            收录大厂真实面试还原、算法解题套路、系统设计拆解与求职通关经验。
          </p>
        </section>

        {/* 渲染列表与筛选 */}
        <section className="mt-8">
          <BlogList posts={posts} />
        </section>
      </div>
    </main>
  );
}
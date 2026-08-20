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

// 开启 ISR 增量静态再生（每 60 秒后台静默刷新）
export const revalidate = 60;

export default async function BlogPage() {
  // 从数据库查询所有面经
  const rawPosts = await prisma.post.findMany({
    orderBy: {
      id: "desc",
    },
  });

  // 格式化处理：确保 content 不为 null，完全匹配 Post 接口类型
  const posts = rawPosts.map((post) => ({
    ...post,
    content: post.content ?? "",
  }));

  return (
    <main className="min-h-screen bg-gray-50 py-16">
      <div className="mx-auto max-w-7xl px-6">
        {/* 页面顶部标题与介绍 */}
        <section>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
            面试经验
          </h1>
          <p className="mt-4 max-w-2xl text-base sm:text-lg leading-8 text-gray-600">
            收录大厂真实面试还原、算法解题套路、系统设计拆解与求职通关经验。
          </p>
        </section>

        {/* 列表与筛选区域 */}
        <section className="mt-10">
          <BlogList posts={posts} />
        </section>
      </div>
    </main>
  );
}
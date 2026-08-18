import BlogList from "@/components/BlogList";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";


export const metadata: Metadata = {
  title: "Software Engineering Interview Blog",

  description:
    "Read software engineering interview experiences, coding preparation guides, system design tutorials, and career advice.",

  alternates: {
    canonical: "/blog",
  },
};


// Blog 首页
export default async function BlogPage() {
  const posts = await prisma.post.findMany({
    orderBy: {
      id: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-gray-50 py-16">
      {/* Blog 页面内容容器 */}
      <div className="mx-auto max-w-7xl px-6">

        {/* Blog 页面顶部 */}
        <section>
          {/* 页面标题 */}
          <h1 className="text-5xl font-bold tracking-tight text-gray-900">
            面试经验
          </h1>

          {/* 页面介绍 */}
          <p className="mt-4 max-w-2xl text-lg leading-8 text-gray-600">
            Real interview experiences, coding guides,
            system design notes, and career preparation.
          </p>
        </section>

        {/* 数据库 Blog 列表 */}
        <section className="mt-10">
          <BlogList posts={posts} />
        </section>

      </div>
    </main>
  );
}
// app/admin/(protected)/posts/page.tsx

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DeletePostButton from "./DeletePostButton";
import ImportPostsButton from "./ImportPostsButton";

export const dynamic = "force-dynamic";

type AdminPostsPageProps = {
  searchParams: Promise<{
    search?: string;
  }>;
};

export default async function AdminPostsPage({
  searchParams,
}: AdminPostsPageProps) {
  const { search } = (await searchParams) || {};
  const trimmedSearch = search?.trim();

  // 1. 查询全部文章
  const allPosts = await prisma.post.findMany({
    orderBy: { id: "asc" }, // 按最早入库正序
  });

  // 🌟 核心：锁定最早创建的前 6 篇（即倒序表格中处于最底部的 6 篇）为免费白名单
  const freePostIds = new Set(allPosts.slice(0, 6).map((p) => p.id));

  // 2. 根据搜索词过滤（表格按 id: desc 倒序展示）
  const posts = await prisma.post.findMany({
    where: trimmedSearch
      ? {
          OR: [
            { title: { contains: trimmedSearch, mode: "insensitive" } },
            { category: { contains: trimmedSearch, mode: "insensitive" } },
            { description: { contains: trimmedSearch, mode: "insensitive" } },
            { slug: { contains: trimmedSearch, mode: "insensitive" } },
            ...(!isNaN(Number(trimmedSearch))
              ? [{ id: Number(trimmedSearch) }]
              : []),
          ],
        }
      : undefined,
    orderBy: {
      id: "desc",
    },
  });

  return (
    <main className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* 顶部标题与操作栏 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-8 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">Blog Posts</h1>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 border border-blue-100">
              共 {posts.length} 篇
              {trimmedSearch && ` (匹配结果)`}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            管理、发布、编辑与删除网站的博客和面试复盘文章。
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <ImportPostsButton />

          <Link
            href="/admin/posts/new"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <span>+</span>
            <span>Add Blog Post</span>
          </Link>
        </div>
      </div>

      {/* 搜索栏 */}
      <section className="mt-8">
        <form method="GET" className="flex gap-3">
          <input
            type="text"
            name="search"
            defaultValue={search || ""}
            placeholder="Search articles by title, category, description, slug or ID..."
            className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Search
          </button>
          {search && (
            <Link
              href="/admin/posts"
              className="flex items-center rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Clear
            </Link>
          )}
        </form>
      </section>

      {/* 文章列表表格 */}
      <div className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {posts.length === 0 ? (
          <div className="py-16 text-center space-y-4">
            <p className="text-gray-500 text-sm font-medium">
              {search ? "No articles matched your search." : "暂无文章，点击上方按钮添加第一篇博客吧！"}
            </p>
            {!search && (
              <div className="flex justify-center gap-3">
                <ImportPostsButton />
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/75 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-4">Title / Slug</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Access</th>
                  <th className="px-6 py-4">Date / Read Time</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {posts.map((post) => {
                  // 🌟 精准判断：只有在最早 6 篇白名单内的文章才显示 Free（即最底部的 6 篇）
                  const isFree = freePostIds.has(post.id);

                  return (
                    <tr
                      key={post.id}
                      className="hover:bg-gray-50/80 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 line-clamp-1">
                          {post.title}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          /blog/{post.slug}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                          {post.category}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {/* 🌟 徽章展示：底部的 6 篇显示 Free，其余上面所有文章显示 Paid */}
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            isFree
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-800 border border-amber-200"
                          }`}
                        >
                          {isFree ? "Free" : "Paid"}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                        <div>{post.date}</div>
                        <div className="text-gray-400">{post.readingTime}</div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                        <div className="flex items-center justify-end gap-3">
                          <Link
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            className="font-medium text-gray-500 hover:text-gray-900 transition"
                          >
                            View
                          </Link>

                          <Link
                            href={`/admin/posts/${post.id}/edit`}
                            className="font-semibold text-blue-600 hover:text-blue-800 transition"
                          >
                            Edit
                          </Link>

                          <DeletePostButton id={post.id} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
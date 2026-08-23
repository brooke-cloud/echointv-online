// app/admin/(protected)/posts/page.tsx

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DeletePostButton from "./DeletePostButton";

export const dynamic = "force-dynamic";

export default async function AdminPostsPage() {
  const posts = await prisma.post.findMany({
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
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            管理、发布、编辑与删除网站的博客和面试复盘文章。
          </p>
        </div>

        <div>
          <Link
            href="/admin/posts/new"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <span>+</span>
            <span>Add Blog Post</span>
          </Link>
        </div>
      </div>

      {/* 文章列表表格 */}
      <div className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {posts.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-gray-400 text-sm">暂无文章，点击上方按钮添加第一篇博客吧！</p>
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
                {posts.map((post, index) => {
                  const isFree =
                    typeof (post as any).isFree === "boolean"
                      ? (post as any).isFree
                      : index < 5;

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

                          {/* 🌟 1. 编辑按钮：跳转到编辑页 */}
                          <Link
                            href={`/admin/posts/${post.id}/edit`}
                            className="font-semibold text-blue-600 hover:text-blue-800 transition"
                          >
                            Edit
                          </Link>

                          {/* 🌟 2. 您的原有删除按钮组件 */}
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
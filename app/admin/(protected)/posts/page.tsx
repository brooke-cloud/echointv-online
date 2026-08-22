// app/admin/(protected)/posts/page.tsx

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DeletePostButton from "./DeletePostButton";

export default async function AdminPostsPage() {
  const posts = await prisma.post.findMany({
    orderBy: { id: "desc" },
  });

  return (
    <div className="space-y-6">
      {/* 顶部标题与发布按钮 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
          <p className="text-sm text-gray-500 mt-1">{posts.length} articles in database</p>
        </div>
        <Link
          href="/admin/posts/new"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition shadow-sm"
        >
          + Add Blog Post
        </Link>
      </div>

      {/* 面经数据表格 */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Title & Slug
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Reading Time
              </th>
              <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-gray-50/80 transition">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-400">
                  {post.id}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-gray-900">{post.title}</div>
                  <div className="text-xs text-gray-400 font-mono">/blog/{post.slug}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                    {post.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                  {post.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                  {post.readingTime}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <Link
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    className="text-xs text-blue-600 hover:underline font-medium"
                  >
                    View →
                  </Link>
                  {/* 🌟 增加删除按钮 */}
                  <DeletePostButton id={post.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
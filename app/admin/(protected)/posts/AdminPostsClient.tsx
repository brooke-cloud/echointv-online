// app/admin/(protected)/posts/AdminPostsClient.tsx

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import DeletePostButton from "./DeletePostButton";

interface Post {
  id: number;
  slug: string;
  title: string;
  category: string;
  date: string;
  readingTime: string;
}

export default function AdminPostsClient({
  initialPosts,
}: {
  initialPosts: Post[];
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return initialPosts;
    const q = searchQuery.toLowerCase().trim();
    return initialPosts.filter((p) => {
      return (
        p.id.toString().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.date.toLowerCase().includes(q)
      );
    });
  }, [initialPosts, searchQuery]);

  return (
    <div className="space-y-6">
      {/* 顶部标题与发布面经按钮 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Blog Posts</h1>
          <p className="text-sm text-gray-500 mt-1">
            {initialPosts.length} articles in database
            {searchQuery && (
              <span className="text-blue-600 font-semibold ml-2">
                · 匹配到 {filteredPosts.length} 篇文章
              </span>
            )}
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition shadow-sm inline-flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>+</span>
          <span>Add Blog Post</span>
        </Link>
      </div>

      {/* 🔍 搜索框 */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="🔍 搜索面经文章标题、分类、Slug 或 ID..."
          className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900 bg-white shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3.5 top-3.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2.5 py-1 rounded-full transition font-medium"
          >
            清空
          </button>
        )}
      </div>

      {/* 面经数据表格 */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Title & Slug
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Reading Time
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {filteredPosts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-400">
                  没有找到匹配的面经文章
                </td>
              </tr>
            ) : (
              filteredPosts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50/80 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-400">
                    {post.id}
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <div className="text-sm font-bold text-gray-900 line-clamp-1">
                      {post.title}
                    </div>
                    <div className="text-xs text-gray-400 font-mono truncate">
                      /blog/{post.slug}
                    </div>
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
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-3">
                    <Link
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      className="text-xs text-blue-600 hover:underline font-medium"
                    >
                      View
                    </Link>
                    <DeletePostButton id={post.id} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
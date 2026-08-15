import Link from "next/link";

import {
  createPost,
} from "../actions";

import BlogContentEditor from "@/components/BlogContentEditor";
import AdminSubmitButton from "@/components/AdminSubmitButton";

// 新增 Blog 页面
export default function NewPostPage() {
  const inputStyle =
    "mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

  return (
    <main className="py-12">

      {/* 页面内容 */}
      <div className="mx-auto max-w-4xl px-5 sm:px-6">

        {/* 返回 */}
        <Link
          href="/admin/posts"
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          ← Back to Blog Posts
        </Link>


        {/* 标题 */}
        <h1 className="mt-8 text-3xl font-bold text-gray-900 sm:text-4xl">
          Add Blog Post
        </h1>


        {/* Blog 表单 */}
        <form
          action={createPost}
          className="mt-10 space-y-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8"
        >

          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="font-medium text-gray-900"
            >
              Title
            </label>

            <input
              id="title"
              name="title"
              required
              maxLength={200}
              className={inputStyle}
            />
          </div>


          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="font-medium text-gray-900"
            >
              Description
            </label>

            <textarea
              id="description"
              name="description"
              required
              rows={4}
              maxLength={500}
              className={inputStyle}
            />
          </div>


          {/* Markdown Content */}
          <BlogContentEditor />


          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="font-medium text-gray-900"
            >
              Category
            </label>

            <input
              id="category"
              name="category"
              required
              maxLength={100}
              className={inputStyle}
            />
          </div>


          {/* Date */}
          <div>
            <label
              htmlFor="date"
              className="font-medium text-gray-900"
            >
              Date
            </label>

            <input
              id="date"
              name="date"
              required
              maxLength={50}
              className={inputStyle}
              placeholder="Aug 14, 2026"
            />
          </div>


          {/* Reading Time */}
          <div>
            <label
              htmlFor="readingTime"
              className="font-medium text-gray-900"
            >
              Reading Time
            </label>

            <input
              id="readingTime"
              name="readingTime"
              required
              maxLength={50}
              className={inputStyle}
              placeholder="6 min read"
            />
          </div>


          {/* Submit */}
          <AdminSubmitButton
            pendingText="Publishing..."
          >
            Create Blog Post
          </AdminSubmitButton>

        </form>

      </div>

    </main>
  );
}
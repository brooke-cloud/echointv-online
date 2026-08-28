// app/admin/(protected)/posts/[id]/edit/page.tsx

import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updatePost } from "../../actions";
import BlogContentEditor from "@/components/BlogContentEditor";
import AdminSubmitButton from "@/components/AdminSubmitButton";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;
  const postId = parseInt(id, 10);

  if (isNaN(postId)) {
    notFound();
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    notFound();
  }

  const updatePostWithId = updatePost.bind(null, post.id);

  const inputStyle =
    "mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

  return (
    <main className="py-12">
      <div className="mx-auto max-w-4xl px-5 sm:px-6">
        <Link
          href="/admin/posts"
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          ← Back to Blog Posts
        </Link>

        <h1 className="mt-8 text-3xl font-bold text-gray-900 sm:text-4xl">
          Edit Blog Post
        </h1>

        <form
          action={updatePostWithId}
          className="mt-10 space-y-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8"
        >
          {/* Title */}
          <div>
            <label htmlFor="title" className="font-medium text-gray-900">
              Title
            </label>
            <input
              id="title"
              name="title"
              required
              maxLength={200}
              defaultValue={post.title}
              className={inputStyle}
            />
          </div>

          {/* Company */}
          <div>
            <label htmlFor="company" className="font-medium text-gray-900">
              Company (目标大厂)
            </label>
            <input
              id="company"
              name="company"
              defaultValue={post.company || ""}
              placeholder="e.g. Amazon, Google, Meta, IBM, TikTok..."
              className={inputStyle}
            />
          </div>

          {/* 🌟 URL / Slug：已恢复为可自由修改的输入框！ */}
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="slug" className="font-medium text-gray-900">
                Slug (URL Identifier)
              </label>
              <span className="text-xs text-blue-600 font-medium">支持自定义修改</span>
            </div>
            <input
              id="slug"
              name="slug"
              required
              maxLength={200}
              defaultValue={post.slug}
              placeholder="e.g. amazon-sde-interview-experience"
              className={inputStyle}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="font-medium text-gray-900">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={3}
              maxLength={500}
              defaultValue={post.description}
              className={inputStyle}
            />
          </div>

          {/* Content */}
          <BlogContentEditor defaultValue={post.content || ""} />

          {/* Category */}
          <div>
            <label htmlFor="category" className="font-medium text-gray-900">
              Category
            </label>
            <input
              id="category"
              name="category"
              required
              maxLength={100}
              defaultValue={post.category}
              className={inputStyle}
            />
          </div>

          {/* Date */}
          <div>
            <label htmlFor="date" className="font-medium text-gray-900">
              Date
            </label>
            <input
              id="date"
              name="date"
              required
              maxLength={50}
              defaultValue={post.date}
              className={inputStyle}
            />
          </div>

          {/* Reading Time */}
          <div>
            <label htmlFor="readingTime" className="font-medium text-gray-900">
              Reading Time
            </label>
            <input
              id="readingTime"
              name="readingTime"
              required
              maxLength={50}
              defaultValue={post.readingTime}
              className={inputStyle}
            />
          </div>

          {/* Submit */}
          <AdminSubmitButton pendingText="Saving...">
            Save Changes
          </AdminSubmitButton>
        </form>
      </div>
    </main>
  );
}
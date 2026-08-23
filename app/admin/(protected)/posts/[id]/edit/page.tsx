// app/admin/(protected)/posts/[id]/edit/page.tsx

import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updatePost } from "../../actions";npm run build
import BlogContentEditor from "@/components/BlogContentEditor";

type EditPostPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditPostPage({
  params,
}: EditPostPageProps) {
  const { id } = await params;
  const postId = Number(id);

  if (Number.isNaN(postId)) {
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
      <div className="mx-auto max-w-4xl px-6">
        <Link
          href="/admin/posts"
          className="text-sm font-medium text-blue-600 transition hover:text-blue-800"
        >
          ← Back to Blog Posts
        </Link>

        <h1 className="mt-8 text-4xl font-bold text-gray-900">
          Edit Blog Post
        </h1>

        <form
          action={updatePostWithId}
          className="mt-10 space-y-8 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm"
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
              defaultValue={post.title}
              className={inputStyle}
            />
          </div>

          {/* Blog URL */}
          <div>
            <p className="font-medium text-gray-900">URL</p>
            <p className="mt-2 rounded-xl bg-gray-100 px-4 py-3 text-sm text-gray-600">
              /blog/{post.slug}
            </p>
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
              rows={4}
              defaultValue={post.description}
              className={inputStyle}
            />
          </div>

          {/* Blog Markdown 内容 */}
          <BlogContentEditor defaultValue={post.content ?? ""} />

          {/* Category */}
          <div>
            <label htmlFor="category" className="font-medium text-gray-900">
              Category
            </label>
            <input
              id="category"
              name="category"
              required
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
              defaultValue={post.readingTime}
              className={inputStyle}
            />
          </div>

          {/* 保存按钮 */}
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
          >
            Save Changes
          </button>
        </form>
      </div>
    </main>
  );
}
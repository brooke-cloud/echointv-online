import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updatePost } from "../../actions";
import BlogContentEditor from "@/components/BlogContentEditor";

type EditPostPageProps = {
  params: Promise<{
    id: string;
  }>;
};

// Blog 编辑页面
export default async function EditPostPage({
  params,
}: EditPostPageProps) {
  const { id } = await params;

  const postId = Number(id);

  if (Number.isNaN(postId)) {
    notFound();
  }

  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
  });

  if (!post) {
    notFound();
  }

  const updatePostWithId =
    updatePost.bind(
      null,
      post.id
    );

  const inputStyle =
    "mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

  return (
    <main className="py-12">
      {/* 页面内容容器 */}
      <div className="mx-auto max-w-4xl px-6">

        {/* 返回 Blog 管理 */}
        <Link
          href="/admin/posts"
          className="text-sm font-medium text-blue-600 transition hover:text-blue-800"
        >
          ← Back to Blog Posts
        </Link>

        {/* 页面标题 */}
        <h1 className="mt-8 text-4xl font-bold text-gray-900">
          Edit Blog Post
        </h1>

        {/* Blog 编辑表单 */}
        <form
          action={updatePostWithId}
          className="mt-10 space-y-8 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm"
        >

          {/* Title */}
          <div>
            {/* 字段名称 */}
            <label
              htmlFor="title"
              className="font-medium text-gray-900"
            >
              Title
            </label>

            {/* Title 输入 */}
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
            {/* 字段名称 */}
            <p className="font-medium text-gray-900">
              URL
            </p>

            {/* 当前 Blog URL */}
            <p className="mt-2 rounded-xl bg-gray-100 px-4 py-3 text-sm text-gray-600">
              /blog/{post.slug}
            </p>
          </div>

          {/* Description */}
          <div>
            {/* 字段名称 */}
            <label
              htmlFor="description"
              className="font-medium text-gray-900"
            >
              Description
            </label>

            {/* Description 编辑 */}
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
          <BlogContentEditor
            defaultValue={post.content ?? ""}
          />


          {/* Category */}
          <div>
            {/* 字段名称 */}
            <label
              htmlFor="category"
              className="font-medium text-gray-900"
            >
              Category
            </label>

            {/* Category 编辑 */}
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
            {/* 字段名称 */}
            <label
              htmlFor="date"
              className="font-medium text-gray-900"
            >
              Date
            </label>

            {/* Date 编辑 */}
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
            {/* 字段名称 */}
            <label
              htmlFor="readingTime"
              className="font-medium text-gray-900"
            >
              Reading Time
            </label>

            {/* Reading Time 编辑 */}
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
            className="
              rounded-xl
              bg-blue-600
              px-6
              py-3
              font-medium
              text-white
              transition
              hover:bg-blue-700
            "
          >
            Save Changes
          </button>

        </form>

      </div>
    </main>
  );
}
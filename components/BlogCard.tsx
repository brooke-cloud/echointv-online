import Link from "next/link";
import type { Post } from "@/types/post";

type BlogCardProps = {
  post: Post;
};

// 单篇 Blog 文章卡片
export default function BlogCard({
  post,
}: BlogCardProps) {
  return (
    <article
      className="
        flex
        h-full
        flex-col
        rounded-2xl
        border
        border-gray-200
        bg-white
        p-7
        shadow-sm
        transition
        hover:-translate-y-1
        hover:shadow-lg
      "
    >
      {/* 文章分类 */}
      <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
        {post.category}
      </p>

      {/* 文章标题 */}
      <h2 className="mt-4 text-2xl font-bold leading-8 text-gray-900">
        {post.title}
      </h2>

      {/* 文章简介 */}
      <p className="mt-4 flex-1 leading-7 text-gray-600">
        {post.description}
      </p>

      {/* 发布时间和阅读时间 */}
      <div className="mt-6 flex flex-wrap items-center gap-2 text-sm text-gray-500">
        {/* 发布时间 */}
        <span>
          {post.date}
        </span>

        {/* 分隔符 */}
        <span>
          ·
        </span>

        {/* 阅读时间 */}
        <span>
          {post.readingTime}
        </span>
      </div>

      {/* 阅读文章链接 */}
      <Link
        href={`/blog/${post.slug}`}
        className="mt-6 inline-block font-medium text-blue-600 transition hover:text-blue-800"
      >
        阅读文章 →
      </Link>
    </article>
  );
}
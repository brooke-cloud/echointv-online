// components/BlogCard.tsx

import Link from "next/link";
import type { Post } from "@/types/post";

type BlogCardProps = {
  post: Post;
};

export default function BlogCard({ post }: BlogCardProps) {
  const isFree = typeof (post as any).isFree === "boolean" ? (post as any).isFree : true;

  const getCategoryBadgeStyle = (cat: string) => {
    const c = cat?.toUpperCase() || "";
    if (c.includes("INTERVIEW") || c.includes("面经")) {
      return "bg-purple-50 text-purple-700 border-purple-200/80";
    }
    if (c.includes("SYSTEM") || c.includes("系统设计")) {
      return "bg-indigo-50 text-indigo-700 border-indigo-200/80";
    }
    if (c.includes("CODING") || c.includes("算法") || c.includes("LEETCODE")) {
      return "bg-sky-50 text-sky-700 border-sky-200/80";
    }
    return "bg-blue-50 text-blue-700 border-blue-200/80";
  };

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex h-full flex-col justify-between rounded-3xl border border-gray-200/90 bg-white p-7 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl min-h-[250px] cursor-pointer"
    >
      <div>
        {/* 顶部：文章类型徽章 + 免费/付费徽章 */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border uppercase tracking-wider ${getCategoryBadgeStyle(
              post.category
            )}`}
          >
            <span>📑</span>
            <span>{post.category}</span>
          </span>

          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
              isFree
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                : "bg-amber-50 text-amber-800 border border-amber-200/80"
            }`}
          >
            {isFree ? "Free" : "Paid"}
          </span>
        </div>

        {/* 文章标题 */}
        <h2 className="mt-3 text-xl font-bold leading-snug text-gray-900 group-hover:text-blue-600 transition-colors">
          {post.title}
        </h2>

        {/* 文章简介 */}
        {post.description && (
          <p className="mt-3 leading-relaxed text-sm text-gray-600 line-clamp-3">
            {post.description}
          </p>
        )}
      </div>

      {/* 🌟 底部：发布时间与阅读时长，整张卡片直接点击进入 */}
      <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400 font-medium">
        <div>
          <span>{post.date}</span>
          <span className="mx-1.5">·</span>
          <span>{post.readingTime || (post as any).readTime || "5 min read"}</span>
        </div>
        <span className="text-blue-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
          阅读全文 →
        </span>
      </div>
    </Link>
  );
}
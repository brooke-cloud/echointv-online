// components/BlogCard.tsx

import Link from "next/link";

interface Post {
  id: number;
  slug: string;
  title: string;
  category: string;
  description: string;
  date: string;
  readingTime: string;
  company?: string;
  isFree?: boolean;
}

const TECH_COMPANIES = [
  "Meta", "Google", "Amazon", "TikTok", "ByteDance",
  "Microsoft", "Apple", "Tencent", "Alibaba", "Stripe", "Netflix"
];

function detectCompany(post: Post): string {
  if (post.company) return post.company;
  const fullText = `${post.title} ${post.category} ${post.description || ""}`;
  for (const comp of TECH_COMPANIES) {
    if (new RegExp(`\\b${comp}\\b|${comp}`, "i").test(fullText)) {
      return comp;
    }
  }
  return "";
}

export default function BlogCard({
  post,
  index = 0,
}: {
  post: Post;
  index?: number;
}) {
  const isFree = typeof post.isFree === "boolean" ? post.isFree : index < 5;
  const comp = detectCompany(post);

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block bg-white p-6 sm:p-7 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition space-y-3"
    >
      {/* 顶部标签：公司 + 分类 + 免费/付费 */}
      <div className="flex flex-wrap items-center gap-2">
        {comp && (
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
            🏢 {comp}
          </span>
        )}

        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-gray-100 text-gray-700">
          {post.category}
        </span>

        {isFree ? (
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            Free
          </span>
        ) : (
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-0.5">
            <span>🔒</span>
            <span>Pro</span>
          </span>
        )}
      </div>

      {/* 标题 */}
      <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition leading-snug">
        {post.title}
      </h2>

      {/* 描述摘要 */}
      {post.description && (
        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
          {post.description}
        </p>
      )}

      {/* 底部时间与链接 */}
      <div className="pt-2 flex items-center justify-between text-xs text-gray-400 border-t border-gray-50">
        <div>
          {post.date} · 预计阅读 {post.readingTime}
        </div>
        <span className="text-blue-600 font-semibold group-hover:underline flex items-center gap-1">
          阅读全文 →
        </span>
      </div>
    </Link>
  );
}
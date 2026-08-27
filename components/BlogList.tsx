// components/BlogList.tsx

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import MarkdownRenderer from "./MarkdownRenderer";

interface Post {
  id: number;
  slug: string;
  title: string;
  category: string;
  description: string;
  content?: string;
  date: string;
  readingTime: string;
  company?: string;
  isFree?: boolean;
}

// 常见大厂关键词检测池
const TECH_COMPANIES = [
  "IBM",
  "Meta",
  "Google",
  "Amazon",
  "Apple",
  "Microsoft",
  "TikTok",
  "ByteDance",
  "Tesla",
  "Nvidia",
  "OpenAI",
  "Uber",
  "Airbnb",
  "Stripe",
  "Netflix",
  "Salesforce",
  "Oracle",
  "Bloomberg",
  "Snowflake",
  "Databricks",
  "Palantir",
  "Coinbase",
  "Robinhood",
  "Sofi",
  "LinkedIn",
  "Pinterest",
  "Snapchat",
  "Snap",
  "Spotify",
  "Twitter",
  "DoorDash",
  "Instacart",
  "Lyft",
  "eBay",
  "PayPal",
  "Square",
  "Block",
  "Shopify",
  "Atlassian",
  "Zoom",
  "Cisco",
  "Intel",
  "AMD",
  "Qualcomm",
  "Tencent",
  "Alibaba",
  "Jane Street",
  "Citadel",
  "Two Sigma",
  "Hudson River Trading",
  "Jump Trading",
];

// 智能识别所属公司
function detectCompany(post: Post): string {
  if (post.company && post.company.trim()) return post.company.trim();
  const fullText = `${post.title} ${post.category} ${post.description || ""}`;
  for (const comp of TECH_COMPANIES) {
    if (new RegExp(`\\b${comp}\\b|${comp}`, "i").test(fullText)) {
      return comp;
    }
  }
  return "";
}

// 🌟 将 Category 字符串拆解为多标签数组
function extractAllTags(rawCategory?: string): string[] {
  if (!rawCategory) return [];
  return rawCategory
    .split(/[,，/]/)
    .map((t) => t.replace(/\(.*?\)/g, "").trim())
    .filter((t) => t && t !== "1");
}

export default function BlogList({
  posts = [],
}: {
  posts?: Post[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const safePosts = useMemo(() => (Array.isArray(posts) ? posts : []), [posts]);

  // 1. 公司列表
  const companies = useMemo(() => {
    const set = new Set<string>();
    safePosts.forEach((p) => {
      const comp = detectCompany(p);
      if (comp) set.add(comp);
    });
    return ["All", ...Array.from(set).sort()];
  }, [safePosts]);

  // 2. 分类栏提取：拆分所有文章的每一个独立标签并去重
  const categories = useMemo(() => {
    const set = new Set<string>();
    safePosts.forEach((p) => {
      const tags = extractAllTags(p.category);
      tags.forEach((tag) => set.add(tag));
    });
    return ["All", ...Array.from(set).sort()];
  }, [safePosts]);

  // 3. 多条件综合过滤（搜索 + 公司 + 多标签匹配）
  const filteredPosts = useMemo(() => {
    return safePosts.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const pCompany = detectCompany(p);
      const postTags = extractAllTags(p.category).map((t) => t.toLowerCase());

      // 搜索匹配
      const matchSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        pCompany.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q);

      // 公司匹配
      const matchCompany =
        selectedCompany === "All" ||
        pCompany.toLowerCase() === selectedCompany.toLowerCase() ||
        p.title.toLowerCase().includes(selectedCompany.toLowerCase());

      // 分类匹配：只要选中的分类包含在文章的任意一个标签中即匹配
      const matchCategory =
        selectedCategory === "All" ||
        postTags.includes(selectedCategory.toLowerCase()) ||
        p.category.toLowerCase().includes(selectedCategory.toLowerCase());

      return matchSearch && matchCompany && matchCategory;
    });
  }, [safePosts, searchQuery, selectedCompany, selectedCategory]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCompany("All");
    setSelectedCategory("All");
  };

  const hasActiveFilters =
    searchQuery !== "" || selectedCompany !== "All" || selectedCategory !== "All";

  return (
    <div className="space-y-8">
      {/* 搜索框 */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="🔍 搜索面经文章标题、目标大厂 (如 IBM / Meta / Amazon / Google)、分类或关键字..."
          className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900 bg-white shadow-sm transition"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-4 top-3.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2.5 py-1 rounded-full transition font-medium"
          >
            清空
          </button>
        )}
      </div>

      {/* 公司筛选 */}
      {companies.length > 1 && (
        <div className="space-y-2.5">
          <div className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            Company (目标大厂)
          </div>
          <div className="flex flex-wrap gap-2">
            {companies.map((comp) => (
              <button
                key={comp}
                onClick={() => setSelectedCompany(comp)}
                className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
                  selectedCompany.toLowerCase() === comp.toLowerCase()
                    ? "bg-blue-600 text-white shadow-sm"
                    : "border border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:text-blue-600"
                }`}
              >
                {comp === "All" ? "All" : `🏢 ${comp}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 分类筛选 */}
      <div className="space-y-2.5">
        <div className="text-xs font-bold text-gray-700 uppercase tracking-wider">
          Category (分类领域)
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
                selectedCategory.toLowerCase() === cat.toLowerCase()
                  ? "bg-blue-600 text-white shadow-sm"
                  : "border border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:text-blue-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 统计栏 */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <span className="text-sm text-gray-500 font-medium">
          {filteredPosts.length} articles found
        </span>
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="text-xs px-3.5 py-1.5 rounded-xl border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 transition font-medium"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* 面经文章列表卡片 */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-gray-200 text-center text-gray-400 space-y-2">
            <p className="text-lg font-bold text-gray-700">没有找到匹配的面经文章</p>
            <p className="text-xs text-gray-400">尝试更换搜索词或清空筛选条件</p>
          </div>
        ) : (
          filteredPosts.map((post, index) => {
            const isFree = typeof post.isFree === "boolean" ? post.isFree : index < 6;
            const comp = detectCompany(post);

            // 🌟 提取该文章包含的所有标签
            const tags = extractAllTags(post.category);

            return (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group block bg-white p-6 sm:p-7 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition space-y-3"
              >
                {/* 顶部标签行：公司 + 🌟完整展示所有标签（如两个标签都显示） + 免费/付费 */}
                <div className="flex flex-wrap items-center gap-2">
                  {comp && (
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                      🏢 {comp}
                    </span>
                  )}

                  {/* 🌟 核心：遍历展示文章的所有分类标签（同时展示多个） */}
                  {tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-gray-100 text-gray-700"
                    >
                      {tag}
                    </span>
                  ))}

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

                {/* 摘要 */}
                {post.description && (
                  <div className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                    <MarkdownRenderer content={post.description} />
                  </div>
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
          })
        )}
      </div>
    </div>
  );
}
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
  "Meta",
  "Google",
  "Amazon",
  "TikTok",
  "ByteDance",
  "Microsoft",
  "Apple",
  "Tencent",
  "Alibaba",
  "Stripe",
  "Netflix",
];

// 智能识别文章所属大厂
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

export default function BlogList({
  posts = [],
}: {
  posts?: Post[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // 确保文章数组安全可用
  const safePosts = useMemo(() => (Array.isArray(posts) ? posts : []), [posts]);

  // 1. 动态提取所有公司列表并去重
  const companies = useMemo(() => {
    const set = new Set<string>();
    safePosts.forEach((p) => {
      const comp = detectCompany(p);
      if (comp) set.add(comp);
    });
    return ["All", ...Array.from(set).sort()];
  }, [safePosts]);

  // 2. 提取一级核心分类并去重
  const categories = useMemo(() => {
    const set = new Set<string>();
    safePosts.forEach((p) => {
      if (p.category) {
        let cat = p.category.split(/[,，/]/)[0].trim();
        cat = cat.replace(/\(.*?\)/g, "").trim();
        cat = cat.replace(/MathAlgorithms.*/i, "Math");
        cat = cat.replace(/SimulationAlgorithms.*/i, "Simulation");
        if (cat && cat !== "1") set.add(cat);
      }
    });
    return ["All", ...Array.from(set).sort()];
  }, [safePosts]);

  // 3. 多条件综合过滤（搜索 + 公司 + 分类）
  const filteredPosts = useMemo(() => {
    return safePosts.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const pCompany = detectCompany(p);

      // 搜索匹配：标题、描述、分类、公司、Slug
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

      // 分类匹配
      const pCat = p.category.split(/[,，/]/)[0].replace(/\(.*?\)/g, "").trim().toLowerCase();
      const matchCategory =
        selectedCategory === "All" ||
        pCat === selectedCategory.toLowerCase() ||
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
      {/* 🌟 1. 搜索框 */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="🔍 搜索面经文章标题、目标大厂 (如 Meta / Amazon / Google)、分类或关键字..."
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

      {/* 🌟 2. Company 大厂筛选 */}
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

      {/* 🌟 3. Category 一级分类筛选 */}
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

      {/* 统计栏与清除筛选按钮 */}
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

      {/* 🌟 4. 面经文章列表卡片 */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-gray-200 text-center text-gray-400 space-y-2">
            <p className="text-lg font-bold text-gray-700">没有找到匹配的面经文章</p>
            <p className="text-xs text-gray-400">尝试更换搜索词或清空筛选条件</p>
          </div>
        ) : (
          filteredPosts.map((post, index) => {
            const isFree = typeof post.isFree === "boolean" ? post.isFree : index < 5;
            const comp = detectCompany(post);

            return (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group block bg-white p-6 sm:p-7 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition space-y-3"
              >
                {/* 顶部标签：公司 + 一级分类 + 免费/付费 */}
                <div className="flex flex-wrap items-center gap-2">
                  {comp && (
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                      🏢 {comp}
                    </span>
                  )}

                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-gray-100 text-gray-700">
                    {post.category.split(/[,，/]/)[0].replace(/\(.*?\)/g, "").trim()}
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

                {/* 🌟 摘要（通过 MarkdownRenderer 支持解析数学公式与行内代码） */}
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
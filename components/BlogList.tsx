// components/BlogList.tsx

"use client";

import { useState, useMemo } from "react";
import BlogCard from "./BlogCard";

interface Post {
  id: number;
  slug: string;
  title: string;
  category: string;
  description: string;
  date: string;
  readingTime: string;
  company?: string;
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

export default function BlogList({
  posts = [], // 🌟 默认空数组，彻底防止 undefined
}: {
  posts?: Post[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // 安全获取文章数组
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

  // 2. 分类列表
  const categories = useMemo(() => {
    const set = new Set<string>();
    safePosts.forEach((p) => {
      if (p.category) {
        let cat = p.category.split(/[,，/]/)[0].trim();
        cat = cat.replace(/\(.*?\)/g, "").trim();
        if (cat && cat !== "1") set.add(cat);
      }
    });
    return ["All", ...Array.from(set).sort()];
  }, [safePosts]);

  // 3. 多条件搜索过滤
  const filteredPosts = useMemo(() => {
    return safePosts.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const pCompany = detectCompany(p);

      const matchSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        pCompany.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q);

      const matchCompany =
        selectedCompany === "All" ||
        pCompany.toLowerCase() === selectedCompany.toLowerCase() ||
        p.title.toLowerCase().includes(selectedCompany.toLowerCase());

      const pCat = p.category.split(/[,，/]/)[0].trim().toLowerCase();
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
      {/* 搜索框 */}
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

      {/* 文章卡片列表 */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-gray-200 text-center text-gray-400 space-y-2">
            <p className="text-lg font-bold text-gray-700">没有找到匹配的面经文章</p>
            <p className="text-xs text-gray-400">尝试更换搜索词或清空筛选条件</p>
          </div>
        ) : (
          filteredPosts.map((post, index) => (
            <BlogCard key={post.id} post={post} index={index} />
          ))
        )}
      </div>
    </div>
  );
}
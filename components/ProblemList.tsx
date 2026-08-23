// components/ProblemList.tsx

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

interface Problem {
  id: number;
  slug: string;
  title: string;
  company: string;
  role?: string;
  difficulty: string;
  category: string;
  description: string;
  topics?: string[];
  stage?: string;
  isFree?: boolean; // 🌟 新增字段
}

export default function ProblemList({ problems }: { problems: Problem[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [selectedStage, setSelectedStage] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // 提取去重后的公司列表
  const companies = useMemo(() => {
    const set = new Set<string>();
    problems.forEach((p) => {
      if (p.company) set.add(p.company);
    });
    return ["All", ...Array.from(set)];
  }, [problems]);

  const difficulties = ["All", "Easy", "Medium", "Hard"];

  const stages = [
    "All",
    "OA (线上测评/笔试)",
    "VO (技术轮面/Onsite)",
  ];

  // 提取去重后的分类列表
  const categories = useMemo(() => {
    const set = new Set<string>();
    problems.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ["All", ...Array.from(set)];
  }, [problems]);

  // 🌟 判定单个题目是否为 OA
  const isProblemOA = (prob: Problem) => {
    const st = ((prob as any).stage || "").toUpperCase();
    const cat = (prob.category || "").toUpperCase();
    const title = (prob.title || "").toUpperCase();
    const desc = (prob.description || "").toUpperCase();
    const topics = (prob.topics || []).map((t) => t.toUpperCase());
    return (
      st === "OA" ||
      st.includes("OA") ||
      cat.includes("OA") ||
      title.includes("OA") ||
      desc.includes("OA") ||
      topics.some((t) => t.includes("OA"))
    );
  };

  // 综合过滤逻辑
  const filteredProblems = useMemo(() => {
    return problems.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.company.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);

      const matchCompany =
        selectedCompany === "All" ||
        p.company.toLowerCase() === selectedCompany.toLowerCase();

      const matchDifficulty =
        selectedDifficulty === "All" ||
        p.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();

      // 🌟 修复后的核心匹配逻辑：使用 includes("OA") 兼容长按钮文本
      const isOA = isProblemOA(p);
      const isFilterAll = selectedStage === "All" || !selectedStage;
      const isFilterOA = selectedStage.toUpperCase().includes("OA");
      const isFilterVO = selectedStage.toUpperCase().includes("VO");

      const matchStage =
        isFilterAll ||
        (isFilterOA && isOA) ||
        (isFilterVO && !isOA);

      const matchCategory =
        selectedCategory === "All" ||
        p.category.toLowerCase() === selectedCategory.toLowerCase();

      return matchSearch && matchCompany && matchDifficulty && matchStage && matchCategory;
    });
  }, [problems, searchQuery, selectedCompany, selectedDifficulty, selectedStage, selectedCategory]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCompany("All");
    setSelectedDifficulty("All");
    setSelectedStage("All");
    setSelectedCategory("All");
  };

  const hasActiveFilters =
    searchQuery !== "" ||
    selectedCompany !== "All" ||
    selectedDifficulty !== "All" ||
    selectedStage !== "All" ||
    selectedCategory !== "All";

  return (
    <div className="space-y-6">
      {/* 搜索框 */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search problems..."
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900 bg-white shadow-sm"
        />
      </div>

      {/* 1. Company 筛选 */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-gray-700 uppercase tracking-wider">Company</div>
        <div className="flex flex-wrap gap-2">
          {companies.map((comp) => (
            <button
              key={comp}
              onClick={() => setSelectedCompany(comp)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
                selectedCompany.toLowerCase() === comp.toLowerCase()
                  ? "bg-blue-600 text-white shadow-sm"
                  : "border border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:text-blue-600"
              }`}
            >
              {comp}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Difficulty 难度筛选 */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-gray-700 uppercase tracking-wider">Difficulty</div>
        <div className="flex flex-wrap gap-2">
          {difficulties.map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
                selectedDifficulty.toLowerCase() === diff.toLowerCase()
                  ? "bg-blue-600 text-white shadow-sm"
                  : "border border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:text-blue-600"
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Stage 考核形式筛选 (OA / VO) */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-gray-700 uppercase tracking-wider">
          Stage (考核形式)
        </div>
        <div className="flex flex-wrap gap-2">
          {stages.map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStage(st)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
                selectedStage === st
                  ? "bg-blue-600 text-white shadow-sm"
                  : "border border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:text-blue-600"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Category 分类筛选 */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-gray-700 uppercase tracking-wider">Category</div>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
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

      {/* 底部统计栏与清除按钮 */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <span className="text-xs sm:text-sm text-gray-500 font-medium">
          {filteredProblems.length} problems found
        </span>
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 transition font-medium"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* 题目卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
        {filteredProblems.map((problem) => {
          const isOA = isProblemOA(problem);

          // 🌟 核心逻辑：获取在全局列表中的原始序号，前 6 道题（index 0~5）自动判定为免费
          const originalIndex = problems.findIndex((p) => p.id === problem.id);
          const isFree =
            typeof problem.isFree === "boolean"
              ? problem.isFree
              : originalIndex !== -1
              ? originalIndex < 6
              : true;

          return (
            <div
              key={problem.id}
              className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition flex flex-col justify-between min-h-[260px]"
            >
              <div>
                {/* 顶部：公司名 + [免费/付费 徽章] + [OA/VO 徽章] + [难度 Badge] */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-blue-600">
                    {problem.company}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {/* 🌟 免费 / 付费 胶囊徽章 */}
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                        isFree
                          ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                          : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {isFree ? "Free" : "Paid"}
                    </span>

                    {/* OA / VO 徽章 */}
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                        isOA
                          ? "bg-purple-100 text-purple-700 border border-purple-200"
                          : "bg-sky-100 text-sky-700 border border-sky-200"
                      }`}
                    >
                      {isOA ? "OA" : "VO"}
                    </span>

                    {/* 难度 Badge */}
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                        problem.difficulty?.toUpperCase() === "EASY"
                          ? "bg-green-100 text-green-700"
                          : problem.difficulty?.toUpperCase() === "MEDIUM"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {problem.difficulty}
                    </span>
                  </div>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mt-4">
                  {problem.title}
                </h3>
                <p className="text-xs text-gray-400 mt-1">{problem.category}</p>
                <p className="text-sm text-gray-600 mt-4 line-clamp-3 leading-relaxed">
                  {problem.description}
                </p>
              </div>

              <div className="mt-6">
                <Link
                  href={`/problem/${problem.slug}`}
                  className="text-sm font-semibold text-blue-600 hover:underline inline-block"
                >
                  查看题目 →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
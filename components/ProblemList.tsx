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
  stage?: string; // 支持 OA / VO 字段
}

export default function ProblemList({ problems }: { problems: Problem[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [selectedStage, setSelectedStage] = useState("All"); // 🌟 新增 OA / VO 状态
  const [selectedCategory, setSelectedCategory] = useState("All");

  // 提取去重后的公司列表
  const companies = useMemo(() => {
    const set = new Set<string>();
    problems.forEach((p) => {
      if (p.company) set.add(p.company);
    });
    return ["All", ...Array.from(set)];
  }, [problems]);

  // 难度选项
  const difficulties = ["All", "Easy", "Medium", "Hard"];

  // 🌟 新增 OA / VO 考核阶段选项
  const stages = [
    { label: "All", value: "All" },
    { label: "OA (线上测评/笔试)", value: "OA" },
    { label: "VO (技术轮面/Onsite)", value: "VO" },
  ];

  // 提取去重后的分类列表
  const categories = useMemo(() => {
    const set = new Set<string>();
    problems.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ["All", ...Array.from(set)];
  }, [problems]);

  // 多条件过滤逻辑
  const filteredProblems = useMemo(() => {
    return problems.filter((p) => {
      // 1. 关键词搜索
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.company.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);

      // 2. 公司过滤
      const matchCompany =
        selectedCompany === "All" ||
        p.company.toLowerCase() === selectedCompany.toLowerCase();

      // 3. 难度过滤
      const matchDifficulty =
        selectedDifficulty === "All" ||
        p.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();

      // 🌟 4. OA / VO 阶段过滤（智能匹配 stage 属性、分类、标签或标题）
      const matchStage =
        selectedStage === "All" ||
        (selectedStage === "OA" &&
          (p.stage?.toUpperCase() === "OA" ||
            p.topics?.some((t) => t.toUpperCase().includes("OA")) ||
            p.category?.toUpperCase().includes("OA") ||
            p.title?.toUpperCase().includes("OA") ||
            p.description?.toUpperCase().includes("OA"))) ||
        (selectedStage === "VO" &&
          (p.stage?.toUpperCase() === "VO" ||
            p.topics?.some((t) => t.toUpperCase().includes("VO")) ||
            p.category?.toUpperCase().includes("VO") ||
            p.title?.toUpperCase().includes("VO") ||
            p.description?.toUpperCase().includes("VO") ||
            // 默认非明确标记 OA 的真题多数归为 VO 面试题
            !p.title?.toUpperCase().includes("OA")));

      // 5. 分类过滤
      const matchCategory =
        selectedCategory === "All" ||
        p.category.toLowerCase() === selectedCategory.toLowerCase();

      return matchSearch && matchCompany && matchDifficulty && matchStage && matchCategory;
    });
  }, [problems, searchQuery, selectedCompany, selectedDifficulty, selectedStage, selectedCategory]);

  // 清空所有筛选
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
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
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
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* 🌟 3. Stage 考核形式筛选 (OA / VO) */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-gray-700 uppercase tracking-wider">
          Stage (考核形式)
        </div>
        <div className="flex flex-wrap gap-2">
          {stages.map((st) => (
            <button
              key={st.value}
              onClick={() => setSelectedStage(st.value)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
                selectedStage === st.value
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {st.label}
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
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
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
        {filteredProblems.map((problem) => (
          <div
            key={problem.id}
            className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition flex flex-col justify-between min-h-[260px]"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-blue-600">
                  {problem.company}
                </span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                    problem.difficulty.toUpperCase() === "EASY"
                      ? "bg-green-100 text-green-700"
                      : problem.difficulty.toUpperCase() === "MEDIUM"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {problem.difficulty}
                </span>
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
        ))}
      </div>
    </div>
  );
}
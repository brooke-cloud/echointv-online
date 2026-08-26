// app/admin/(protected)/problems/AdminProblemsClient.tsx

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { deleteProblem } from "./actions";
import ConfirmDeleteButton from "@/components/ConfirmDeleteButton";

interface Problem {
  id: number;
  slug: string;
  title: string;
  company: string;
  role?: string;
  difficulty: string;
  category: string;
  stage?: string;
}

export default function AdminProblemsClient({
  initialProblems,
}: {
  initialProblems: Problem[];
}) {
  const [searchQuery, setSearchQuery] = useState("");

  // 实时搜索过滤
  const filteredProblems = useMemo(() => {
    if (!searchQuery.trim()) return initialProblems;
    const q = searchQuery.toLowerCase().trim();
    return initialProblems.filter((p) => {
      return (
        p.id.toString().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        p.company.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.difficulty.toLowerCase().includes(q) ||
        (p.stage && p.stage.toLowerCase().includes(q)) ||
        p.slug.toLowerCase().includes(q)
      );
    });
  }, [initialProblems, searchQuery]);

  return (
    <div className="space-y-6">
      {/* 顶部标题与新建按钮 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Problems</h1>
          <p className="text-sm text-gray-500 mt-1">
            {initialProblems.length} problems in database
            {searchQuery && (
              <span className="text-blue-600 font-semibold ml-2">
                · 匹配到 {filteredProblems.length} 道题目
              </span>
            )}
          </p>
        </div>
        <Link
          href="/admin/problems/new"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition shadow-sm inline-flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>+</span>
          <span>Add Problem</span>
        </Link>
      </div>

      {/* 🔍 搜索栏 */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="🔍 搜索题目名称、公司 (如 Amazon / Google)、分类、难度或 ID..."
          className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900 bg-white shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3.5 top-3.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2.5 py-1 rounded-full transition font-medium"
          >
            清空
          </button>
        )}
      </div>

      {/* 题目数据表格 */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Company
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Difficulty
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {filteredProblems.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-400">
                  没有找到匹配的题目
                </td>
              </tr>
            ) : (
              filteredProblems.map((prob) => (
                <tr key={prob.id} className="hover:bg-gray-50/80 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-400">
                    {prob.id}
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <div className="text-sm font-bold text-gray-900 line-clamp-1">
                      {prob.title}
                    </div>
                    <div className="text-xs text-gray-400 font-mono truncate">
                      /problem/{prob.slug}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                    {prob.company}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                        prob.difficulty?.toLowerCase() === "easy"
                          ? "bg-green-100 text-green-700"
                          : prob.difficulty?.toLowerCase() === "medium"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {prob.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500 max-w-[200px] truncate">
                    {prob.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/problem/${prob.slug}`}
                        target="_blank"
                        className="text-xs text-gray-500 hover:text-gray-900 font-medium"
                      >
                        View
                      </Link>
                      <Link
                        href={`/admin/problems/${prob.id}/edit`}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Edit
                      </Link>
                      {/* 🌟 使用您项目中现有的 ConfirmDeleteButton */}
                      <ConfirmDeleteButton
                        action={deleteProblem.bind(null, prob.id)}
                        itemName={prob.title}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
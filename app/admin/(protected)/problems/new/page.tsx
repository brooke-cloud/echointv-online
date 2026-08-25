// app/admin/(protected)/problems/new/page.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { createProblem } from "../actions";
import { Sparkles, CheckCircle2, ArrowDown, FileText, AlertCircle, Loader2 } from "lucide-react";

export default function NewProblemPage() {
  const [rawText, setRawText] = useState("");
  const [parseSuccess, setParseSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // 表单状态
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [stage, setStage] = useState("VO");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [example, setExample] = useState("");
  const [approach, setApproach] = useState("");
  const [solution, setSolution] = useState("");
  const [timeComplexity, setTimeComplexity] = useState("");
  const [spaceComplexity, setSpaceComplexity] = useState("");
  const [topics, setTopics] = useState("");
  const [similarProblems, setSimilarProblems] = useState("");

  // 🌟 一键智能分词解析
  const handleSmartParse = () => {
    if (!rawText.trim()) {
      alert("请先在上方粘贴题目大纲内容！");
      return;
    }

    const lines = rawText.replace(/\r\n/g, "\n").split("\n");
    const collected: Record<string, string[]> = {};
    let currentKey = "";

    const headerMap = [
      { key: "title", keywords: ["title", "标题", "题目标题"] },
      { key: "company", keywords: ["company", "公司", "目标公司"] },
      { key: "role", keywords: ["role", "岗位", "招聘岗位"] },
      { key: "difficulty", keywords: ["difficulty", "难度"] },
      { key: "stage", keywords: ["stage", "考核形式", "面试形式", "轮次"] },
      { key: "category", keywords: ["category", "分类", "类别"] },
      { key: "description", keywords: ["description", "题目描述", "描述"] },
      { key: "example", keywords: ["example", "输入输出示例", "示例"] },
      { key: "approach", keywords: ["approach", "解题思路", "思路", "核心思路"] },
      { key: "timeComplexity", keywords: ["time complexity", "时间复杂度"] },
      { key: "spaceComplexity", keywords: ["space complexity", "空间复杂度"] },
      { key: "topics", keywords: ["topics", "考点", "标签", "相关考点"] },
      {
        key: "similarProblems",
        keywords: [
          "leetcode 相似题目推荐",
          "similar problems",
          "相似题目",
          "leetcode 相似题",
          "推荐题目",
          "相似题",
        ],
      },
      { key: "solution", keywords: ["solution", "代码", "核心代码", "参考代码"] },
    ];

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed === "---" || trimmed === "***" || trimmed === "___") continue;

      let matchedHeaderKey = "";
      for (const item of headerMap) {
        for (const kw of item.keywords) {
          const cleanLine = trimmed
            .replace(/^#+\s*/, "")
            .replace(/^\*\*|\*\*$/g, "")
            .replace(/^【|】$/g, "")
            .trim()
            .toLowerCase();

          if (
            cleanLine === kw.toLowerCase() ||
            cleanLine.startsWith(kw.toLowerCase() + ":") ||
            cleanLine.startsWith(kw.toLowerCase() + "：") ||
            cleanLine.startsWith(kw.toLowerCase() + "(") ||
            cleanLine.startsWith(kw.toLowerCase() + "（")
          ) {
            matchedHeaderKey = item.key;
            break;
          }
        }
        if (matchedHeaderKey) break;
      }

      if (matchedHeaderKey) {
        currentKey = matchedHeaderKey;
        if (!collected[currentKey]) collected[currentKey] = [];

        const colonIdx = line.indexOf(":") !== -1 ? line.indexOf(":") : line.indexOf("：");
        if (colonIdx !== -1) {
          const afterColon = line.slice(colonIdx + 1).replace(/\*\*$/, "").trim();
          if (afterColon) collected[currentKey].push(afterColon);
        }
      } else if (currentKey) {
        collected[currentKey].push(line);
      }
    }

    if (collected.title) setTitle(collected.title.join("\n").trim());
    if (collected.company) setCompany(collected.company.join("\n").trim());
    if (collected.role) setRole(collected.role.join("\n").trim());
    if (collected.difficulty) {
      const d = collected.difficulty.join(" ").toLowerCase();
      if (d.includes("easy") || d.includes("简单")) setDifficulty("Easy");
      else if (d.includes("hard") || d.includes("困难")) setDifficulty("Hard");
      else setDifficulty("Medium");
    }
    if (collected.stage) {
      const s = collected.stage.join(" ").toUpperCase();
      setStage(s.includes("OA") ? "OA" : "VO");
    }
    if (collected.category) setCategory(collected.category.join("\n").trim());
    if (collected.description) setDescription(collected.description.join("\n").trim());
    if (collected.example) setExample(collected.example.join("\n").trim());
    if (collected.approach) setApproach(collected.approach.join("\n").trim());
    if (collected.timeComplexity) setTimeComplexity(collected.timeComplexity.join("\n").trim());
    if (collected.spaceComplexity) setSpaceComplexity(collected.spaceComplexity.join("\n").trim());
    if (collected.topics) setTopics(collected.topics.join("\n").trim());
    if (collected.similarProblems) setSimilarProblems(collected.similarProblems.join("\n").trim());
    
    // 🌟 修复关键点：使用 codeMatch.trim()
    if (collected.solution) {
      const rawSol = collected.solution.join("\n").trim();
      const codeMatch = rawSol.match(/```(?:python|py)?\s*([\s\S]*?)```/i);
      if (codeMatch) {
        setSolution(codeMatch[1].trim());
      } else {
        setSolution(rawSol);
      }
    }

    setParseSuccess(true);
    setTimeout(() => setParseSuccess(false), 4000);
  };

  // 表单提交处理函数
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      await createProblem(formData);
    } catch (err: any) {
      if (err?.message?.includes("NEXT_REDIRECT")) {
        return;
      }
      setSubmitError(err?.message || "创建失败，请核对必填项");
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle =
    "mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

  return (
    <main className="py-12">
      <div className="mx-auto max-w-4xl px-6 space-y-8">
        
        {/* 返回 */}
        <Link
          href="/admin/problems"
          className="text-sm font-medium text-blue-600 transition hover:text-blue-800"
        >
          ← Back to Problems
        </Link>

        {/* 标题 */}
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Add Interview Problem
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            录入大厂高频面试真题。支持在下方直接一键粘贴整篇文本智能识别。
          </p>
        </div>

        {/* 1. 核心智能解析专区 */}
        <div className="rounded-3xl border-2 border-blue-200 bg-gradient-to-b from-blue-50/50 via-white to-white p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900">
                一键智能解析与快速录入 (Smart Auto-Fill)
              </h2>
              <p className="text-xs text-gray-500">
                直接在此粘贴整篇题目（包含 **Title**、**Company**、**Description** 等），系统自动分拆并填充下方所有表单。
              </p>
            </div>
          </div>

          <textarea
            rows={6}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="在此粘贴包含 **Title**、**Company**、**Description**、**Example**、**Approach**、**Solution** 的整篇文本..."
            className="w-full rounded-2xl border border-blue-200 bg-white p-4 text-xs sm:text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-mono leading-relaxed"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={handleSmartParse}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-blue-700 hover:shadow-lg transition transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>⚡ 一键智能解析并填入下方表单</span>
              <ArrowDown className="h-4 w-4" />
            </button>

            {parseSuccess && (
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 animate-fade-in">
                <CheckCircle2 className="h-4 w-4" />
                <span>已成功自动识别并填入所有字段！请在下方核对</span>
              </div>
            )}
          </div>
        </div>

        {/* 2. 表单明细 */}
        <form
          onSubmit={handleSubmit}
          className="space-y-8 rounded-3xl border border-gray-200 bg-white p-6 sm:p-10 shadow-sm"
        >
          <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
            <FileText className="h-5 w-5 text-gray-400" />
            <h2 className="text-base font-bold text-gray-900">
              题目表单明细（可二次调整与校对）
            </h2>
          </div>

          {/* 错误提示条 */}
          {submitError && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700 animate-fade-in">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label htmlFor="title" className="font-semibold text-gray-900 text-sm">
              Title (题目标题) *
            </label>
            <input
              id="title"
              name="title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 时间序列合并（Merge Two Sparse Time Series）"
              className={inputStyle}
            />
          </div>

          {/* Company & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="company" className="font-semibold text-gray-900 text-sm">
                Company (目标公司) *
              </label>
              <input
                id="company"
                name="company"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Meta, Google, 北美大厂"
                className={inputStyle}
              />
            </div>
            <div>
              <label htmlFor="role" className="font-semibold text-gray-900 text-sm">
                Role (招聘岗位)
              </label>
              <input
                id="role"
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. SDE / Backend Engineer"
                className={inputStyle}
              />
            </div>
          </div>

          {/* Difficulty & Stage & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label htmlFor="difficulty" className="font-semibold text-gray-900 text-sm">
                Difficulty (难度)
              </label>
              <select
                id="difficulty"
                name="difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className={inputStyle}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div>
              <label htmlFor="stage" className="font-semibold text-gray-900 text-sm">
                Stage (考核形式)
              </label>
              <select
                id="stage"
                name="stage"
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className={inputStyle}
              >
                <option value="OA">OA (线上测评/笔试)</option>
                <option value="VO">VO (技术轮面/Onsite)</option>
              </select>
            </div>

            <div>
              <label htmlFor="category" className="font-semibold text-gray-900 text-sm">
                Category (分类) *
              </label>
              <input
                id="category"
                name="category"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Algorithms / Two Pointers"
                className={inputStyle}
              />
            </div>
          </div>

          {/* Problem Description */}
          <div>
            <label htmlFor="description" className="font-semibold text-gray-900 text-sm">
              Problem Description (题目描述) *
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="给定两条按时间递增排序的稀疏时间序列..."
              className={inputStyle}
            />
          </div>

          {/* Example */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="example" className="font-semibold text-gray-900 text-sm">
                Example (输入输出示例 - 支持 Markdown 格式)
              </label>
              <span className="text-xs text-blue-600 font-medium">Markdown Format Supported</span>
            </div>
            <textarea
              id="example"
              name="example"
              rows={6}
              value={example}
              onChange={(e) => setExample(e.target.value)}
              placeholder={`示例 1:\n输入：序列 A = ...\n输出：...`}
              className={`${inputStyle} font-mono`}
            />
          </div>

          {/* Approach */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="approach" className="font-semibold text-gray-900 text-sm">
                Approach (解题思路 - 支持 Markdown 格式)
              </label>
              <span className="text-xs text-blue-600 font-medium">Markdown Format Supported</span>
            </div>
            <textarea
              id="approach"
              name="approach"
              rows={8}
              value={approach}
              onChange={(e) => setApproach(e.target.value)}
              placeholder="本题本质是将多条稀疏时间序列合并成一条压缩事件流..."
              className={inputStyle}
            />
          </div>

          {/* Solution Code */}
          <div>
            <label htmlFor="solution" className="font-semibold text-gray-900 text-sm">
              Solution (核心代码)
            </label>
            <textarea
              id="solution"
              name="solution"
              rows={10}
              value={solution}
              onChange={(e) => setSolution(e.target.value)}
              placeholder="from typing import List, Tuple..."
              className={`${inputStyle} font-mono`}
            />
          </div>

          {/* Time Complexity & Space Complexity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="timeComplexity" className="font-semibold text-gray-900 text-sm">
                  Time Complexity (支持多行列表)
                </label>
                <span className="text-xs text-gray-400">支持 - 列表</span>
              </div>
              <textarea
                id="timeComplexity"
                name="timeComplexity"
                rows={4}
                value={timeComplexity}
                onChange={(e) => setTimeComplexity(e.target.value)}
                placeholder={`- 最坏情况：O(n + m)\n- 最好情况：O(n + m)`}
                className={`${inputStyle} font-mono`}
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="spaceComplexity" className="font-semibold text-gray-900 text-sm">
                  Space Complexity (支持多行列表)
                </label>
                <span className="text-xs text-gray-400">支持 - 列表</span>
              </div>
              <textarea
                id="spaceComplexity"
                name="spaceComplexity"
                rows={4}
                value={spaceComplexity}
                onChange={(e) => setSpaceComplexity(e.target.value)}
                placeholder={`- 辅助空间：O(1)\n- 输入存储：O(n + m)`}
                className={`${inputStyle} font-mono`}
              />
            </div>
          </div>

          {/* Topics */}
          <div>
            <label htmlFor="topics" className="font-semibold text-gray-900 text-sm">
              Topics (考点标签)
            </label>
            <input
              id="topics"
              name="topics"
              value={topics}
              onChange={(e) => setTopics(e.target.value)}
              placeholder="e.g. Two Pointers, Merge, Sweep Line, State Machine, Data Compression"
              className={inputStyle}
            />
            <p className="mt-1 text-xs text-gray-400">多个考点标签用逗号隔开。</p>
          </div>

          {/* LeetCode 相似题目推荐 */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="similarProblems" className="font-semibold text-gray-900 text-sm flex items-center gap-1.5">
                <span>🎯</span>
                <span>LeetCode 相似题目推荐 (Similar LeetCode Problems)</span>
              </label>
              <span className="text-xs text-gray-400">多个题目用逗号隔开</span>
            </div>
            <input
              id="similarProblems"
              name="similarProblems"
              value={similarProblems}
              onChange={(e) => setSimilarProblems(e.target.value)}
              placeholder="21. 合并两个有序链表，986. 区间列表的交集，56. 合并区间，218. 天际线问题"
              className={inputStyle}
            />
          </div>

          {/* 提交按钮 */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 text-sm font-bold text-white shadow-lg transition hover:bg-blue-700 hover:shadow-xl disabled:opacity-50 cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>正在提交题目入库并生成静态路由...</span>
              </>
            ) : (
              <span>Create Problem (立即提交入库)</span>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
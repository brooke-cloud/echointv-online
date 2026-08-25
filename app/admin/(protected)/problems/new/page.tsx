// app/admin/(protected)/problems/new/page.tsx

import Link from "next/link";
import { createProblem } from "../actions";

export default function NewProblemPage() {
  const inputStyle =
    "mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

  return (
    <main className="py-12">
      <div className="mx-auto max-w-4xl px-6">
        {/* 返回 */}
        <Link
          href="/admin/problems"
          className="text-sm font-medium text-blue-600 transition hover:text-blue-800"
        >
          ← Back to Problems
        </Link>

        {/* 标题 */}
        <h1 className="mt-8 text-3xl font-bold text-gray-900">
          Add Interview Problem
        </h1>

        {/* 表单 */}
        <form
          action={createProblem}
          className="mt-10 space-y-8 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm"
        >
          {/* Title */}
          <div>
            <label htmlFor="title" className="font-semibold text-gray-900 text-sm">
              Title
            </label>
            <input
              id="title"
              name="title"
              required
              placeholder="e.g. 第K大元素 (Kth Largest Element in an Array)"
              className={inputStyle}
            />
          </div>

          {/* Company & Role (双列排布) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="company" className="font-semibold text-gray-900 text-sm">
                Company
              </label>
              <input
                id="company"
                name="company"
                required
                placeholder="e.g. Meta, Google, Amazon"
                className={inputStyle}
              />
            </div>
            <div>
              <label htmlFor="role" className="font-semibold text-gray-900 text-sm">
                Role (e.g. Software Engineer)
              </label>
              <input
                id="role"
                name="role"
                placeholder="e.g. SDE, Software Engineer"
                className={inputStyle}
              />
            </div>
          </div>

          {/* Difficulty & Stage & Category (三列排布) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label htmlFor="difficulty" className="font-semibold text-gray-900 text-sm">
                Difficulty
              </label>
              <select
                id="difficulty"
                name="difficulty"
                defaultValue="Medium"
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
                defaultValue="VO"
                className={inputStyle}
              >
                <option value="OA">OA (线上测评/笔试)</option>
                <option value="VO">VO (技术轮面/Onsite)</option>
              </select>
            </div>

            <div>
              <label htmlFor="category" className="font-semibold text-gray-900 text-sm">
                Category
              </label>
              <input
                id="category"
                name="category"
                required
                placeholder="e.g. Algorithms, System Design"
                className={inputStyle}
              />
            </div>
          </div>

          {/* Problem Description */}
          <div>
            <label htmlFor="description" className="font-semibold text-gray-900 text-sm">
              Problem Description
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              placeholder="题目描述内容..."
              className={inputStyle}
            />
          </div>

          {/* Example (支持 Markdown) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="example" className="font-semibold text-gray-900 text-sm">
                Example (输入输出示例 - 支持 Markdown 格式)
              </label>
              <span className="text-xs text-blue-600">Markdown Format Supported</span>
            </div>
            <textarea
              id="example"
              name="example"
              rows={6}
              placeholder={`示例 1:\n输入: \`nums =\`, \`k = 2\`\n输出: \`5\`\n解释: 排序后第 2 大元素为 5。`}
              className={inputStyle}
            />
          </div>

          {/* Approach (支持 Markdown) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="approach" className="font-semibold text-gray-900 text-sm">
                Approach (解题思路 - 支持 Markdown)
              </label>
              <span className="text-xs text-blue-600">Markdown Format Supported</span>
            </div>
            <textarea
              id="approach"
              name="approach"
              rows={8}
              placeholder="解题思路分析、算法推导与追问总结..."
              className={inputStyle}
            />
          </div>

          {/* Solution Code */}
          <div>
            <label htmlFor="solution" className="font-semibold text-gray-900 text-sm">
              Solution (Python / 核心代码)
            </label>
            <textarea
              id="solution"
              name="solution"
              rows={8}
              placeholder="def solution(...):"
              className={`${inputStyle} font-mono`}
            />
          </div>

          {/* Time Complexity & Space Complexity (多行输入) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="timeComplexity" className="font-semibold text-gray-900 text-sm">
                  Time Complexity (支持换行与 Markdown)
                </label>
                <span className="text-xs text-gray-400">支持列表</span>
              </div>
              <textarea
                id="timeComplexity"
                name="timeComplexity"
                rows={4}
                placeholder={`例如：\n- \`access / peek\` : \`O(1)\`\n- \`get_recent_list(k)\` : \`O(k)\`\n- 多用户管理 : \`O(1)\` 平均`}
                className={`${inputStyle} font-mono`}
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="spaceComplexity" className="font-semibold text-gray-900 text-sm">
                  Space Complexity (支持换行与 Markdown)
                </label>
                <span className="text-xs text-gray-400">支持列表</span>
              </div>
              <textarea
                id="spaceComplexity"
                name="spaceComplexity"
                rows={4}
                placeholder={`例如：\n- 单用户: \`O(capacity)\`\n- 多用户: \`O(total_capacity)\`，可通过懒加载优化`}
                className={`${inputStyle} font-mono`}
              />
            </div>
          </div>

          {/* Topics */}
          <div>
            <label htmlFor="topics" className="font-semibold text-gray-900 text-sm">
              Topics (标签)
            </label>
            <input
              id="topics"
              name="topics"
              placeholder="e.g. Array, Heap (Priority Queue), Two Pointers"
              className={inputStyle}
            />
            <p className="mt-1 text-xs text-gray-400">Separate topics with commas.</p>
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
              placeholder="例如：373. 查找和最小的 K 对数字, 378. 有序矩阵中第 K 小的元素"
              className={inputStyle}
            />
            <p className="mt-1 text-xs text-gray-400">
              填写相关的 LeetCode 题号与题目名称，将在前台详情页底部作为刷题延伸推荐展示。
            </p>
          </div>

          {/* 提交按钮 */}
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 shadow-sm"
          >
            Create Problem
          </button>
        </form>
      </div>
    </main>
  );
}
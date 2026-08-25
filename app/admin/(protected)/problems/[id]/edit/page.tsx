// app/admin/(protected)/problems/[id]/edit/page.tsx

import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateProblem } from "../../actions";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditProblemPage({ params }: Props) {
  const { id } = await params;
  const problemId = Number(id);

  if (isNaN(problemId)) {
    notFound();
  }

  const problem = await prisma.problem.findUnique({
    where: { id: problemId },
  });

  if (!problem) {
    notFound();
  }

  const updateProblemWithId = updateProblem.bind(null, problem.id);

  const inputStyle =
    "mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

  return (
    <main className="py-12">
      <div className="mx-auto max-w-4xl px-6">
        <Link
          href="/admin/problems"
          className="text-sm font-medium text-blue-600 transition hover:text-blue-800"
        >
          ← Back to Problems
        </Link>

        <h1 className="mt-8 text-3xl font-bold text-gray-900">
          Edit Interview Problem
        </h1>

        <form
          action={updateProblemWithId}
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
              defaultValue={problem.title}
              className={inputStyle}
            />
          </div>

          {/* Company & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="company" className="font-semibold text-gray-900 text-sm">
                Company
              </label>
              <input
                id="company"
                name="company"
                required
                defaultValue={problem.company}
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
                defaultValue={problem.role || ""}
                className={inputStyle}
              />
            </div>
          </div>

          {/* Difficulty & Stage & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label htmlFor="difficulty" className="font-semibold text-gray-900 text-sm">
                Difficulty
              </label>
              <select
                id="difficulty"
                name="difficulty"
                defaultValue={problem.difficulty}
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
                defaultValue={(problem as any).stage || "VO"}
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
                defaultValue={problem.category}
                className={inputStyle}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="font-semibold text-gray-900 text-sm">
              Problem Description
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              defaultValue={problem.description}
              className={inputStyle}
            />
          </div>

          {/* Example */}
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
              defaultValue={problem.example || ""}
              placeholder={`**输入：** \`nums1 =\`, \`nums2 =\`, \`k = 3\`\n\n**输出：** \`,,]\`\n\n**解释：** 所有可能的和依次为...`}
              className={inputStyle}
            />
          </div>

          {/* Approach */}
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
              defaultValue={problem.approach || ""}
              placeholder="支持 ## 标题、**加粗**、- 列表、`代码` 等 Markdown 语法..."
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
              rows={8}
              defaultValue={problem.solution || ""}
              className={`${inputStyle} font-mono`}
            />
          </div>

          {/* 🌟 核心升级：Time Complexity 与 Space Complexity 改为多行 Textarea */}
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
                defaultValue={problem.timeComplexity || ""}
                placeholder={`例如：\n• \`access / peek\` : \`O(1)\`\n• \`get_recent_list(k)\` : \`O(k)\`\n• 多用户管理 : \`O(1)\` 平均`}
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
                defaultValue={problem.spaceComplexity || ""}
                placeholder={`例如：\n• 单用户: \`O(capacity)\`\n• 多用户: \`O(total_capacity)\`，可通过懒加载优化`}
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
              defaultValue={Array.isArray(problem.topics) ? problem.topics.join(", ") : ""}
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
              defaultValue={(problem as any).similarProblems || ""}
              placeholder="例如：373. 查找和最小的 K 对数字, 378. 有序矩阵中第 K 小的元素"
              className={inputStyle}
            />
          </div>

          {/* 提交按钮 */}
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 shadow-sm"
          >
            Save Changes
          </button>
        </form>
      </div>
    </main>
  );
}
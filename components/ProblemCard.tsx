// components/ProblemCard.tsx

import Link from "next/link";
import type { Problem } from "@/types/problem";

type ProblemCardProps = {
  problem: Problem & { stage?: string };
};

export default function ProblemCard({ problem }: ProblemCardProps) {
  // 难度样式
  const difficultyStyle =
    problem.difficulty?.toLowerCase() === "easy"
      ? "bg-green-100 text-green-700"
      : problem.difficulty?.toLowerCase() === "medium"
      ? "bg-amber-100 text-amber-800"
      : "bg-red-100 text-red-700";

  // 判定是否为 OA 题目
  const isOA =
    problem.stage?.toUpperCase() === "OA" ||
    problem.title?.toUpperCase().includes("OA") ||
    problem.category?.toUpperCase().includes("OA") ||
    problem.topics?.some((t: string) => t.toUpperCase().includes("OA"));

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between min-h-[260px]">
      <div>
        {/* 🌟 公司与 [OA/VO] + [难度] 标签并排展示 */}
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-bold text-blue-600">
            {problem.company}
          </span>

          <div className="flex items-center gap-1.5">
            {/* OA / VO 胶囊徽章 */}
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                isOA
                  ? "bg-purple-100 text-purple-700 border border-purple-200"
                  : "bg-sky-100 text-sky-700 border border-sky-200"
              }`}
            >
              {isOA ? "OA" : "VO"}
            </span>

            {/* 难度徽章 */}
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${difficultyStyle}`}>
              {problem.difficulty}
            </span>
          </div>
        </div>

        {/* 题目标题 */}
        <h2 className="mt-4 text-xl font-bold text-gray-900">
          {problem.title}
        </h2>

        {/* 题目分类 */}
        <p className="mt-1 text-xs text-gray-400">
          {problem.category}
        </p>

        {/* 题目简介 */}
        <p className="mt-4 text-sm text-gray-600 leading-relaxed line-clamp-3">
          {problem.description}
        </p>
      </div>

      {/* 查看题目链接 */}
      <div className="mt-6">
        <Link
          href={`/problem/${problem.slug}`}
          className="text-sm font-semibold text-blue-600 transition hover:underline inline-block"
        >
          查看题目 →
        </Link>
      </div>
    </div>
  );
}
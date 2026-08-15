import Link from "next/link";
import type { Problem } from "@/types/problem";

type ProblemCardProps = {
  problem: Problem;
};

// 单道面试题卡片
export default function ProblemCard({
  problem,
}: ProblemCardProps) {
  const difficultyStyle =
    problem.difficulty === "Easy"
      ? "bg-green-100 text-green-700"
      : problem.difficulty === "Medium"
        ? "bg-yellow-100 text-yellow-700"
        : "bg-red-100 text-red-700";

  return (
    <div
      className="
        rounded-2xl
        border
        border-gray-200
        bg-white
        p-6
        shadow-sm
        transition
        hover:-translate-y-1
        hover:shadow-lg
      "
    >
      {/* 公司和难度 */}
      <div className="flex items-center justify-between gap-4">
        {/* 公司 */}
        <span className="text-sm font-semibold text-blue-600">
          {problem.company}
        </span>

        {/* 难度 */}
        <span
          className={`rounded-full px-3 py-1 text-sm ${difficultyStyle}`}
        >
          {problem.difficulty}
        </span>
      </div>

      {/* 题目标题 */}
      <h2 className="mt-5 text-xl font-bold text-gray-900">
        {problem.title}
      </h2>

      {/* 题目分类 */}
      <p className="mt-3 text-sm text-gray-500">
        {problem.category}
      </p>

      {/* 题目简介 */}
      <p className="mt-4 leading-7 text-gray-600">
        {problem.description}
      </p>

      {/* 查看题目 */}
      <Link
        href={`/problem/${problem.slug}`}
        className="mt-6 inline-block font-medium text-blue-600 transition hover:text-blue-800"
      >
        查看题目 →
      </Link>
    </div>
  );
}
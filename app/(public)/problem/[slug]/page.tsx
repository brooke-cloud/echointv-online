import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import CodeBlock from "@/components/CodeBlock";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Building2,
  Tag,
  Clock,
  HardDrive,
  Sparkles,
} from "lucide-react";

type Props = {
  params: Promise<{ slug: string }>;
};

// 1. 动态生成 SEO 标题与描述
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const problem = await prisma.problem.findUnique({
    where: { slug },
  });

  if (!problem) {
    return {
      title: "题目未找到 | Echo INTV",
    };
  }

  const title = `${problem.title} (${problem.company} ${problem.difficulty}) - 面试真题解析`;
  const description = problem.description
    ? problem.description.slice(0, 150).replace(/\n/g, " ") + "..."
    : `练习 ${problem.company} 高频面试题 ${problem.title}，查看详细解题思路、时间与空间复杂度分析。`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
    },
  };
}

// 难度颜色映射工具函数
const getDifficultyBadge = (difficulty: string) => {
  const diff = difficulty?.toLowerCase();
  if (diff === "easy") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
  if (diff === "medium") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }
  if (diff === "hard") {
    return "bg-rose-50 text-rose-700 border-rose-200";
  }
  return "bg-gray-50 text-gray-700 border-gray-200";
};

export default async function ProblemDetailPage({ params }: Props) {
  const { slug } = await params;

  // 2. 查询当前题目数据
  const problem = await prisma.problem.findUnique({
    where: { slug },
  });

  if (!problem) {
    notFound();
  }

  // 3. 并行查询「上一题」、「下一题」与「相关推荐真题」
  const [prevProblem, nextProblem, relatedProblems] = await Promise.all([
    // 上一题 (按创建时间较早的题目)
    prisma.problem.findFirst({
      where: { createdAt: { lt: problem.createdAt } },
      orderBy: { createdAt: "desc" },
      select: { slug: true, title: true, difficulty: true },
    }),
    // 下一题 (按创建时间较晚的题目)
    prisma.problem.findFirst({
      where: { createdAt: { gt: problem.createdAt } },
      orderBy: { createdAt: "asc" },
      select: { slug: true, title: true, difficulty: true },
    }),
    // 相关真题推荐：同公司或同分类的其它 3 道题目
    prisma.problem.findMany({
      where: {
        id: { not: problem.id },
        OR: [{ company: problem.company }, { category: problem.category }],
      },
      take: 3,
      select: {
        id: true,
        slug: true,
        title: true,
        company: true,
        difficulty: true,
        category: true,
      },
    }),
  ]);

  return (
    <div className="min-h-screen bg-gray-50/50 py-10 sm:py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        
        {/* 面包屑导航 */}
        <div className="mb-6 flex items-center gap-2 text-sm text-gray-900">
          <Link href="/problem" className="hover:text-blue-600">
            面试真题
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium truncate">
            {problem.title}
          </span>
        </div>

        {/* 题目主卡片 */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-10 shadow-sm">
          
          {/* 题目头部信息 */}
          <div className="border-b border-gray-100 pb-6">
            <div className="flex flex-wrap items-center gap-3">
              {/* 目标公司标签 */}
              <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 border border-blue-100">
                <Building2 className="h-3.5 w-3.5" />
                {problem.company}
              </span>

              {/* 难度标签 */}
              <span
                className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${getDifficultyBadge(
                  problem.difficulty
                )}`}
              >
                {problem.difficulty}
              </span>

              {/* 类别标签 */}
              <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                <Tag className="h-3 w-3" />
                {problem.category}
              </span>
            </div>

            <h1 className="mt-4 text-2xl font-bold text-gray-900 sm:text-3xl">
              {problem.title}
            </h1>
          </div>

          {/* 题目描述 (Problem Description) */}
          <div className="mt-8">
            <h2 className="text-lg font-bold text-gray-900">Problem Description</h2>
            <div className="mt-3 text-gray-700">
              <MarkdownRenderer content={problem.description} />
            </div>
          </div>

          {/* 示例 (Example) */}
          {problem.example && (
            <div className="mt-8">
              <h2 className="text-lg font-bold text-gray-900">Example</h2>
              <div className="mt-3 rounded-xl border border-gray-100 bg-gray-50/80 p-4 font-mono text-sm text-gray-800">
                <pre className="whitespace-pre-wrap">{problem.example}</pre>
              </div>
            </div>
          )}

          {/* 解题思路 (Approach) */}
          {problem.approach && (
            <div className="mt-8">
              <h2 className="text-lg font-bold text-gray-900">Approach</h2>
              <div className="mt-3 text-gray-700">
                <MarkdownRenderer content={problem.approach} />
              </div>
            </div>
          )}

          {/* 复杂度卡片 (Complexity) */}
          {(problem.timeComplexity || problem.spaceComplexity) && (
            <div className="mt-8">
              <h2 className="text-lg font-bold text-gray-900">Complexity</h2>
              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {problem.timeComplexity && (
                  <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/40 p-4">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <div>
                      <span className="block text-xs font-medium text-gray-500">
                        Time Complexity
                      </span>
                      <span className="font-mono text-sm font-semibold text-gray-900">
                        {problem.timeComplexity}
                      </span>
                    </div>
                  </div>
                )}
                {problem.spaceComplexity && (
                  <div className="flex items-center gap-3 rounded-xl border border-purple-100 bg-purple-50/40 p-4">
                    <HardDrive className="h-5 w-5 text-purple-600" />
                    <div>
                      <span className="block text-xs font-medium text-gray-500">
                        Space Complexity
                      </span>
                      <span className="font-mono text-sm font-semibold text-gray-900">
                        {problem.spaceComplexity}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 解题代码 (Solution) */}
          {problem.solution && (
            <div className="mt-8">
              <h2 className="text-lg font-bold text-gray-900">Solution</h2>
              <CodeBlock
                code={problem.solution}
                language="python"
                title="Python 3 Solution"
              />
            </div>
          )}

          {/* 相关考点标签 (Topics) */}
          {problem.topics && problem.topics.length > 0 && (
            <div className="mt-8 border-t border-gray-100 pt-6">
              <h3 className="text-sm font-semibold text-gray-500">Related Topics</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {problem.topics.map((topic, index) => (
                  <span
                    key={index}
                    className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 🌟 1. 上一题 / 下一题 导航区域 */}
          <div className="mt-10 flex flex-col gap-4 border-t border-gray-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
            {prevProblem ? (
              <Link
                href={`/problem/${prevProblem.slug}`}
                className="group flex flex-1 items-center gap-3 rounded-xl border border-gray-200 p-4 transition hover:border-blue-300 hover:bg-blue-50/30"
              >
                <ChevronLeft className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition" />
                <div className="text-left">
                  <span className="block text-xs text-gray-400">上一题</span>
                  <span className="line-clamp-1 text-sm font-medium text-gray-800 group-hover:text-blue-600">
                    {prevProblem.title}
                  </span>
                </div>
              </Link>
            ) : (
              <div className="flex-1"></div>
            )}

            {nextProblem && (
              <Link
                href={`/problem/${nextProblem.slug}`}
                className="group flex flex-1 items-center justify-end gap-3 rounded-xl border border-gray-200 p-4 transition hover:border-blue-300 hover:bg-blue-50/30 text-right"
              >
                <div>
                  <span className="block text-xs text-gray-400">下一题</span>
                  <span className="line-clamp-1 text-sm font-medium text-gray-800 group-hover:text-blue-600">
                    {nextProblem.title}
                  </span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition" />
              </Link>
            )}
          </div>

        </div>

        {/* 🌟 2. 相关真题推荐 (Related Problems) */}
        {relatedProblems.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <h2 className="text-xl font-bold text-gray-900">
                相关大厂真题推荐
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {relatedProblems.map((item) => (
                <Link
                  key={item.id}
                  href={`/problem/${item.slug}`}
                  className="group flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-400 hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-blue-600">
                        {item.company}
                      </span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${getDifficultyBadge(
                          item.difficulty
                        )}`}
                      >
                        {item.difficulty}
                      </span>
                    </div>

                    <h3 className="mt-2.5 line-clamp-2 text-sm font-bold text-gray-900 group-hover:text-blue-600">
                      {item.title}
                    </h3>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-3 text-xs text-gray-400">
                    <span>{item.category}</span>
                    <span className="inline-flex items-center gap-1 font-medium text-blue-600 group-hover:underline">
                      做题 <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
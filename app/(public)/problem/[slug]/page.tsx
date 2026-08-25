// app/(public)/problem/[slug]/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";
import PaywallCard from "@/components/PaywallCard";
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
  Code2,
} from "lucide-react";

type Props = {
  params: Promise<{ slug: string }>;
};

// ⚡ 1. 开启 ISR 增量静态再生
export const revalidate = 60;
export const dynamicParams = true;

// ⚡ 2. 预生成静态路由参数
export async function generateStaticParams() {
  const problems = await prisma.problem.findMany({
    select: { slug: true },
  });
  return problems.map((problem) => ({
    slug: problem.slug,
  }));
}

// 1. 动态生成 SEO 标题与描述
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const problem = await prisma.problem.findFirst({
    where: {
      OR: [{ slug }, { slug: decodedSlug }],
    },
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

// 复杂度卡片
function ComplexityCard({
  title,
  icon,
  content,
  theme,
}: {
  title: string;
  icon: React.ReactNode;
  content: string;
  theme: "blue" | "purple";
}) {
  const isBlue = theme === "blue";

  return (
    <div
      className={`rounded-2xl border p-6 space-y-3.5 shadow-2xs ${
        isBlue
          ? "border-blue-100 bg-gradient-to-b from-blue-50/20 to-white"
          : "border-purple-100 bg-gradient-to-b from-purple-50/20 to-white"
      }`}
    >
      <div
        className={`flex items-center gap-2.5 pb-3 border-b ${
          isBlue ? "border-blue-100/80" : "border-purple-100/80"
        }`}
      >
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-base shadow-2xs ${
            isBlue
              ? "bg-blue-100 text-blue-600"
              : "bg-purple-100 text-purple-600"
          }`}
        >
          {icon}
        </div>
        <h3 className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wider">
          {title}
        </h3>
      </div>

      <div className="text-sm text-gray-800 leading-relaxed pl-1">
        <MarkdownRenderer content={content} />
      </div>
    </div>
  );
}

export default async function ProblemDetailPage({ params }: Props) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const problem = await prisma.problem.findFirst({
    where: {
      OR: [{ slug }, { slug: decodedSlug }],
    },
  });

  if (!problem) {
    notFound();
  }

  // 前 6 道题免费
  const freeProblems = await prisma.problem.findMany({
    take: 6,
    orderBy: { id: "asc" },
    select: { id: true },
  });

  const isFree =
    typeof (problem as any).isFree === "boolean"
      ? (problem as any).isFree
      : freeProblems.some((p) => p.id === problem.id);

  const session = await getCurrentUser();
  let isMember = false;

  const ADMIN_EMAILS = ["admin@echointv.com", "shihaoy74@gmail.com"];

  if (session) {
    const user = await prisma.user.findUnique({
      where: { id: session.id },
    });

    const isEmailAdmin =
      session.email && ADMIN_EMAILS.includes(session.email.toLowerCase().trim());
    isMember =
      isEmailAdmin ||
      user?.role === "PRO" ||
      user?.role === "ADMIN" ||
      Boolean((user as any)?.isVip);
  }

  // 是否有权查看完整内容
  const canAccess = isFree || isMember;

  // 4. 并行查询「上一题」、「下一题」与「相关推荐真题」
  const [prevProblem, nextProblem, relatedProblems] = await Promise.all([
    prisma.problem.findFirst({
      where: { createdAt: { lt: problem.createdAt } },
      orderBy: { createdAt: "desc" },
      select: { slug: true, title: true, difficulty: true },
    }),
    prisma.problem.findFirst({
      where: { createdAt: { gt: problem.createdAt } },
      orderBy: { createdAt: "asc" },
      select: { slug: true, title: true, difficulty: true },
    }),
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
        
        {/* 返回按钮 */}
        <div className="mb-6">
          <Link
            href="/problem"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 hover:text-blue-600 hover:border-gray-300 transition"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>返回题库列表</span>
          </Link>
        </div>

        {/* 题目主卡片 */}
        <div className="rounded-3xl border border-gray-200/90 bg-white p-6 sm:p-10 shadow-sm relative overflow-hidden space-y-8">
          
          {/* 题目头部信息 */}
          <div className="border-b border-gray-100 pb-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-100">
                <Building2 className="h-3.5 w-3.5" />
                {problem.company}
              </span>

              <span
                className={`rounded-lg border px-3 py-1 text-xs font-bold ${
                  isFree
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}
              >
                {isFree ? "Free (免费题)" : "Paid (VIP专享)"}
              </span>

              <span
                className={`rounded-lg border px-3 py-1 text-xs font-bold ${getDifficultyBadge(
                  problem.difficulty
                )}`}
              >
                {problem.difficulty}
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                <Tag className="h-3.5 w-3.5" />
                {problem.category}
              </span>
            </div>

            <h1 className="mt-5 text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-snug">
              {problem.title}
            </h1>
          </div>

          {/* 🔒 权限控制区 */}
          {canAccess ? (
            <div className="space-y-8">
              
              {/* 1. Problem Description */}
              {problem.description && (
                <div className="rounded-2xl border border-blue-100/90 bg-gradient-to-b from-blue-50/30 via-white to-white p-6 sm:p-8 shadow-xs">
                  <div className="flex items-center justify-between mb-5 pb-3.5 border-b border-blue-100/70">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-700 text-base shadow-2xs">
                        📝
                      </span>
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                        Problem Description (题目描述)
                      </h2>
                    </div>
                    <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/60 shadow-2xs">
                      Question Details
                    </span>
                  </div>

                  <div className="text-gray-800 leading-relaxed text-sm sm:text-base prose prose-blue max-w-none font-normal">
                    <MarkdownRenderer content={problem.description} />
                  </div>
                </div>
              )}

              {/* 🌟 2. 核心修复：Example 示例（全面调用 MarkdownRenderer 渲染） */}
              {problem.example && (
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-6 sm:p-7 space-y-3.5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-100 text-purple-700 text-sm shadow-2xs font-bold">
                      🔍
                    </span>
                    <h2 className="text-base sm:text-lg font-bold text-gray-900">
                      Example (输入输出示例)
                    </h2>
                  </div>

                  {/* 🌟 通过 MarkdownRenderer 渲染，反引号 ` 自动转化为高亮代码胶囊 */}
                  <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 text-sm sm:text-base text-gray-800 shadow-2xs leading-relaxed prose prose-purple max-w-none font-medium">
                    <MarkdownRenderer content={problem.example} />
                  </div>
                </div>
              )}

              {/* 3. Approach */}
              {problem.approach && (
                <div className="rounded-2xl border border-amber-200/70 bg-gradient-to-b from-amber-50/30 via-white to-white p-6 sm:p-8 shadow-xs">
                  <div className="flex items-center justify-between mb-5 pb-3.5 border-b border-amber-100">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-700 text-base shadow-2xs">
                        💡
                      </span>
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                        Approach (核心思维推导与最优策略)
                      </h2>
                    </div>
                    <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200/60 shadow-2xs">
                      Optimal Strategy
                    </span>
                  </div>

                  <div className="text-gray-800 leading-relaxed prose prose-blue max-w-none text-sm sm:text-base">
                    <MarkdownRenderer content={problem.approach} />
                  </div>
                </div>
              )}

              {/* 4. 复杂度卡片 */}
              {(problem.timeComplexity || problem.spaceComplexity) && (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {problem.timeComplexity && (
                    <ComplexityCard
                      title="Time Complexity (时间复杂度)"
                      icon={<Clock className="h-4.5 w-4.5" />}
                      content={problem.timeComplexity}
                      theme="blue"
                    />
                  )}

                  {problem.spaceComplexity && (
                    <ComplexityCard
                      title="Space Complexity (空间复杂度)"
                      icon={<HardDrive className="h-4.5 w-4.5" />}
                      content={problem.spaceComplexity}
                      theme="purple"
                    />
                  )}
                </div>
              )}

              {/* 5. 最优解代码 */}
              {problem.solution && (
                <div>
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-3">
                    <Code2 className="h-5 w-5 text-blue-600" />
                    <span>Solution (Python 3 最优解)</span>
                  </h2>
                  <CodeBlock
                    code={problem.solution}
                    language="python"
                    title="Python 3 Solution"
                  />
                </div>
              )}

              {/* 6. 核心考点标签 */}
              {problem.topics && problem.topics.length > 0 && (
                <div className="border-t border-gray-100 pt-6">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Related Topics · 核心算法考点
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {problem.topics.map((topic, index) => (
                      <span
                        key={index}
                        className="rounded-xl bg-gray-100 px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200 transition"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 7. LeetCode 相似题目推荐 */}
              {(problem as any).similarProblems && (
                <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-6 sm:p-7">
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500 text-white font-bold text-xs shadow-2xs">
                      LC
                    </span>
                    <h3 className="text-base font-bold text-gray-900">
                      LeetCode 相似题目推荐与延伸练习
                    </h3>
                  </div>
                  <p className="text-xs text-gray-500 mb-4">
                    掌握同类考点的变体套路与最优解模板，举一反三快速拿下技术面试：
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    {((problem as any).similarProblems as string)
                      .split(/[,，]/)
                      .map((item) => item.trim())
                      .filter(Boolean)
                      .map((item, idx) => (
                        <div
                          key={idx}
                          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-gray-200/80 text-xs font-semibold text-gray-800 shadow-2xs hover:border-blue-300 hover:text-blue-600 transition"
                        >
                          <span className="text-amber-500">⚡</span>
                          <span>{item}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* 付费拦截 */
            <div className="relative mt-8">
              <div className="filter blur-xs select-none pointer-events-none opacity-40 space-y-4">
                <div className="h-24 bg-gray-100 rounded-xl" />
                <div className="h-44 bg-gray-900 rounded-xl" />
              </div>
              <PaywallCard isLoggedIn={Boolean(session)} />
            </div>
          )}

          {/* 上一题 / 下一题 导航 */}
          <div className="mt-10 flex flex-col gap-4 border-t border-gray-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
            {prevProblem ? (
              <Link
                href={`/problem/${prevProblem.slug}`}
                className="group flex flex-1 items-center gap-3 rounded-2xl border border-gray-200 p-4 transition hover:border-blue-300 hover:bg-blue-50/30 shadow-2xs"
              >
                <ChevronLeft className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition" />
                <div className="text-left">
                  <span className="block text-xs text-gray-400">上一题</span>
                  <span className="line-clamp-1 text-sm font-semibold text-gray-800 group-hover:text-blue-600">
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
                className="group flex flex-1 items-center justify-end gap-3 rounded-2xl border border-gray-200 p-4 transition hover:border-blue-300 hover:bg-blue-50/30 text-right shadow-2xs"
              >
                <div>
                  <span className="block text-xs text-gray-400">下一题</span>
                  <span className="line-clamp-1 text-sm font-semibold text-gray-800 group-hover:text-blue-600">
                    {nextProblem.title}
                  </span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition" />
              </Link>
            )}
          </div>

        </div>

        {/* 相关真题推荐 */}
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
                  className="group flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-400 hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-blue-600">
                        {item.company}
                      </span>
                      <span
                        className={`rounded-lg px-2 py-0.5 text-[10px] font-bold ${getDifficultyBadge(
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
                    <span className="inline-flex items-center gap-1 font-semibold text-blue-600 group-hover:underline">
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
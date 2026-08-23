// app/(public)/page.tsx

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Echo INTV - 高效备战技术面试，拿下一线科技大厂 Offer",
  description: "专注收录 Google、Meta、Amazon 等顶尖大厂高频面试真题与解题复盘。",
};

export default async function HomePage() {
  const [totalProblems, totalPosts, distinctCompanies, latestProblems, latestPosts] =
    await Promise.all([
      prisma.problem.count(),
      prisma.post.count(),
      prisma.problem.findMany({ select: { company: true }, distinct: ["company"] }),
      prisma.problem.findMany({ take: 6, orderBy: { createdAt: "desc" } }),
      prisma.post.findMany({ take: 3, orderBy: { createdAt: "desc" } }),
    ]);

  const companyList =
    distinctCompanies.map((c) => c.company).filter(Boolean).length > 0
      ? distinctCompanies.map((c) => c.company).filter(Boolean)
      : ["Google", "Meta", "Amazon", "TikTok", "Microsoft", "Apple", "ByteDance"];

  const stats = [
    { value: `${totalProblems > 0 ? totalProblems : 6}+`, label: "Interview Problems" },
    { value: `${totalPosts > 0 ? totalPosts : 5}+`, label: "Interview Articles" },
    { value: `${companyList.length || 4}+`, label: "Companies Covered" },
  ];

  return (
    <main className="min-h-screen bg-white">
      {/* 🌟 1. Hero 视觉区与核心数据横幅 */}
      <section className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-8">
        <div>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold border border-blue-100 shadow-sm">
            ✨ 2026 北美与全球科技大厂面试真题库
          </span>
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight">
            高效备战技术面试 <br />
            <span className="text-blue-600">拿下一线科技大厂 Offer</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed pt-2">
            专注收录 Google、Meta、Amazon、TikTok 等顶尖大厂高频面试真题与解题复盘，告别题海战术，掌握核心解题策略。
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/problem"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm sm:text-base shadow-md transition"
          >
            <span>&lt;/&gt;</span>
            <span>立即开始刷题 ({totalProblems > 0 ? `${totalProblems}道真题` : "6道真题"})</span>
          </Link>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm sm:text-base border border-gray-200 shadow-sm transition"
          >
            <span>📖</span>
            <span>阅读大厂面经</span>
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 pt-4 text-xs sm:text-sm text-gray-500">
          <div><span className="text-emerald-500 font-bold">✓</span> 真实大厂考点还原</div>
          <div><span className="text-emerald-500 font-bold">✓</span> 代码语法高亮与复杂度分析</div>
          <div><span className="text-emerald-500 font-bold">✓</span> 1 对 1 定制辅导支持</div>
        </div>

        {/* 🏢 热门大厂 Companies 标签栏 */}
        <div className="pt-4 flex flex-col items-center justify-center gap-3">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            COMPANIES · 收录目标名企高频考题
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
            {companyList.map((company) => (
              <Link
                key={company}
                href="/problem"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-600 border border-gray-200/80 text-xs font-semibold shadow-sm transition hover:border-blue-200 hover:shadow"
              >
                <span>🏢</span>
                <span>{company}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* 📊 核心数据统计横幅 */}
        <div className="pt-6 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-8 border border-gray-200/80 shadow-sm text-center space-y-2">
                <div className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">{stat.value}</div>
                <div className="text-sm font-medium text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🌟 2. WHY ECHOINTV 核心特性 */}
      <section className="py-20 bg-gray-50/60 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs font-bold tracking-widest text-blue-600 uppercase">
            WHY ECHOINTV 为什么选择 ECHOINTV
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900">
            一站式搞定技术面试全流程
          </h2>
          <p className="text-sm sm:text-base text-gray-500 max-w-2xl mx-auto">
            把精力集中在真正考察的核心技能上，拒绝无效搜索与低效盲目刷题。
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-10 text-left">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <div className="text-2xl">🎯</div>
                <h3 className="text-lg font-bold text-gray-900 mt-3">精准大厂高频题</h3>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                  按公司归类真题，掌握出题趋势与核心考查偏好。
                </p>
              </div>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <div className="text-2xl">⚡</div>
                <h3 className="text-lg font-bold text-gray-900 mt-3">深度思路与代码复盘</h3>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                  详解从暴力解到最优解的思维推导与时间空间复杂度。
                </p>
              </div>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <div className="text-2xl">📑</div>
                <h3 className="text-lg font-bold text-gray-900 mt-3">个性化做题进度追踪</h3>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                  一键打卡已掌握题目，建立个人收藏夹，量化学练进度。
                </p>
              </div>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-3 flex flex-col justify-between hover:border-blue-300 transition">
              <div>
                <div className="text-2xl">✨</div>
                <h3 className="text-lg font-bold text-gray-900 mt-3">1对1大厂导师辅导</h3>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                  北美一线大厂工程师提供 1v1 Mock、简历精修与深度复盘。
                </p>
              </div>
              <div className="pt-3 border-t border-gray-100">
                <Link href="/contact" className="text-xs font-semibold text-blue-600 hover:underline">
                  了解导师服务 →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🌟 3. Latest Interview Problems (已添加 OA / VO 标签) */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Latest Interview Problems</h2>
              <p className="text-sm text-gray-500 mt-1">Practice coding and technical interview questions.</p>
            </div>
            <Link href="/problem" className="text-sm font-semibold text-blue-600 hover:underline">
              View All Problems →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {latestProblems.map((p) => {
              const isOA =
                (p as any).stage?.toUpperCase() === "OA" ||
                p.title.toUpperCase().includes("OA") ||
                p.category.toUpperCase().includes("OA");

              return (
                <Link
                  key={p.id}
                  href={`/problem/${p.slug}`}
                  className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    {/* 🌟 头部标签组：公司 + [OA/VO] + 难度 */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-blue-50 text-blue-600">
                        {p.company}
                      </span>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          isOA
                            ? "bg-purple-100 text-purple-700 border border-purple-200"
                            : "bg-sky-100 text-sky-700 border border-sky-200"
                        }`}
                      >
                        {isOA ? "OA" : "VO"}
                      </span>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-gray-100 text-gray-600">
                        {p.difficulty}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900">{p.title}</h3>
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">{p.description}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-400 font-medium">{p.category}</div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 🌟 4. Latest Articles */}
      <section className="py-16 bg-gray-50/50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Learn</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">Latest Articles</h2>
              <p className="text-sm text-gray-500 mt-1">Interview experiences, guides, and software engineering advice.</p>
            </div>
            <Link href="/blog" className="text-sm font-semibold text-blue-600 hover:underline">
              View All Articles →
            </Link>
          </div>

          <div className="space-y-4">
            {latestPosts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="block bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition space-y-2"
              >
                <span className="text-xs font-semibold text-blue-600">{post.category}</span>
                <h3 className="text-lg font-bold text-gray-900">{post.title}</h3>
                {post.description && <p className="text-sm text-gray-500 line-clamp-2">{post.description}</p>}
                <div className="text-xs text-gray-400 pt-2">{post.date} · {post.readingTime}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
// app/admin/page.tsx

import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [
    totalUsers,
    proUsers,
    totalProblems,
    totalPosts,
    recentUsers,
    recentProblems,
    recentPosts,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "PRO" } }),
    prisma.problem.count(),
    prisma.post.count(),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    }),
    prisma.problem.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, company: true, difficulty: true, createdAt: true },
    }),
    prisma.post.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, category: true, date: true, createdAt: true },
    }),
  ]);

  const stats = [
    { title: "注册用户总数", value: totalUsers, desc: "全站注册求职者", icon: "👥" },
    { title: "Pro 会员总数", value: proUsers, desc: "当前付费订阅人数", icon: "⭐" },
    { title: "大厂面试真题", value: totalProblems, desc: "已收录真题总库", icon: "💻" },
    { title: "发布面经专栏", value: totalPosts, desc: "深度求职指南文章", icon: "📖" },
  ];

  return (
    <div className="space-y-8">
      {/* 顶部标题栏 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">运营数据总览</h1>
          <p className="text-sm text-gray-500 mt-1">监控 EchoINTV 全站数据、用户增长与内容状态</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/problems/new"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition shadow-sm whitespace-nowrap"
          >
            + 新增题目
          </Link>
          <Link
            href="/admin/posts/new"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl transition shadow-sm whitespace-nowrap"
          >
            + 发布面经
          </Link>
        </div>
      </div>

      {/* 4 个指标卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">{stat.title}</span>
              <span className="text-xl">{stat.icon}</span>
            </div>
            <div className="text-3xl font-extrabold text-gray-900">{stat.value}</div>
            <div className="text-xs text-gray-400 truncate">{stat.desc}</div>
          </div>
        ))}
      </div>

      {/* 3 列数据列表（保持原版清爽卡片样式） */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* 1. 最新注册用户 */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900">最新注册用户</h3>
            <span className="text-xs text-gray-400">最近 5 位</span>
          </div>

          <div className="divide-y divide-gray-100">
            {recentUsers.map((u) => (
              <div key={u.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-gray-900 truncate">
                    {u.name || u.email.split("@")[0]}
                  </div>
                  <div className="text-xs text-gray-400 font-mono truncate">{u.email}</div>
                </div>
                <div className="flex flex-col items-end flex-shrink-0">
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                      u.role === "ADMIN"
                        ? "bg-purple-100 text-purple-700"
                        : u.role === "PRO"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {u.role}
                  </span>
                  <span className="text-[10px] text-gray-400 mt-1">
                    {new Date(u.createdAt).toLocaleDateString("zh-CN")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. 最近录入题目 */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900">最近录入题目</h3>
            <span className="text-xs text-gray-400">最近 5 道</span>
          </div>

          <div className="divide-y divide-gray-100">
            {recentProblems.map((prob) => (
              <div key={prob.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-gray-900 truncate">{prob.title}</div>
                  <div className="text-xs text-gray-400 truncate">🏢 {prob.company}</div>
                </div>
                <div className="flex flex-col items-end flex-shrink-0">
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                      prob.difficulty.toUpperCase() === "EASY"
                        ? "bg-green-100 text-green-700"
                        : prob.difficulty.toUpperCase() === "MEDIUM"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {prob.difficulty}
                  </span>
                  <span className="text-[10px] text-gray-400 mt-1">
                    {new Date(prob.createdAt).toLocaleDateString("zh-CN")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. 最近发布面经 */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900">最近发布面经</h3>
            <span className="text-xs text-gray-400">最近 5 篇</span>
          </div>

          <div className="divide-y divide-gray-100">
            {recentPosts.map((post) => (
              <div key={post.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-gray-900 truncate">{post.title}</div>
                  <div className="text-xs text-gray-400 truncate">
                    📅 {post.date || new Date(post.createdAt).toLocaleDateString("zh-CN")}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-purple-50 text-purple-700 border border-purple-100 whitespace-nowrap">
                    {post.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
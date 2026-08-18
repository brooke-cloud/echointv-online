import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/user-auth";
import { prisma } from "@/lib/prisma";
import {
  Mail,
  Calendar,
  Code2,
  BookOpen,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
} from "lucide-react";

export const metadata: Metadata = {
  title: "个人中心 | EchoINTV",
  description: "查看您的求职准备进度、刷题数据与专属学习路线。",
};

export default async function ProfilePage() {
  const user = await getCurrentUser();

  // 未登录拦截并重定向到登录页
  if (!user) {
    redirect("/login");
  }

  // 统计系统题目总数与难度分布
  const [totalProblems, easyCount, mediumCount, hardCount, totalPosts] =
    await Promise.all([
      prisma.problem.count(),
      prisma.problem.count({ where: { difficulty: "Easy" } }),
      prisma.problem.count({ where: { difficulty: "Medium" } }),
      prisma.problem.count({ where: { difficulty: "Hard" } }),
      prisma.post.count(),
    ]);

  const joinDate = new Date(user.createdAt).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-50/50 py-10 sm:py-14">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        
        {/* ================= 1. 用户基础信息卡片 ================= */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            
            <div className="flex items-center gap-4">
              {/* 用户头像徽标 */}
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-2xl font-bold text-white shadow-md shadow-blue-500/20">
                {(user.name || user.email)[0].toUpperCase()}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {user.name || user.email.split("@")[0]}
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-100">
                    <Award className="h-3 w-3" />
                    EchoINTV 会员
                  </span>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" />
                    {user.email}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    加入时间：{joinDate}
                  </span>
                </div>
              </div>
            </div>

            {/* 快捷做题入口按钮 */}
            <Link
              href="/problem"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500"
            >
              <Code2 className="h-4 w-4" />
              进入题库刷题
            </Link>

          </div>
        </div>

        {/* ================= 2. 题库与真题统计数据 ================= */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">
              题库大厂真题总览
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* 总题目卡片 */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between text-gray-500">
                <span className="text-xs font-medium">真题总库</span>
                <Code2 className="h-4 w-4 text-blue-600" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">{totalProblems}</span>
                <span className="text-xs text-gray-400">道大厂真题</span>
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div className="h-full bg-blue-600 rounded-full w-full"></div>
              </div>
            </div>

            {/* Easy 难度 */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between text-gray-500">
                <span className="text-xs font-medium text-emerald-700">简单题 (Easy)</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">{easyCount}</span>
                <span className="text-xs text-gray-400">道题目</span>
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{
                    width: `${totalProblems ? (easyCount / totalProblems) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Medium 难度 */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between text-gray-500">
                <span className="text-xs font-medium text-amber-700">中等题 (Medium)</span>
                <span className="h-2 w-2 rounded-full bg-amber-500"></span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">{mediumCount}</span>
                <span className="text-xs text-gray-400">道高频题</span>
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{
                    width: `${totalProblems ? (mediumCount / totalProblems) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Hard 难度 */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between text-gray-500">
                <span className="text-xs font-medium text-rose-700">困难题 (Hard)</span>
                <span className="h-2 w-2 rounded-full bg-rose-500"></span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">{hardCount}</span>
                <span className="text-xs text-gray-400">道挑战题</span>
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full bg-rose-500 rounded-full"
                  style={{
                    width: `${totalProblems ? (hardCount / totalProblems) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= 3. 专属求职服务与精选资源 ================= */}
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          
          {/* 面经专栏入口 */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-gray-900">
                  大厂面试经验与技术指南
                </h3>
              </div>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                收录了 Meta、Amazon、Google 等顶尖科技公司的真实面试真题还原、BQ 答题技巧与系统设计拆解。
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
                <span>已更新 {totalPosts} 篇深度求职面经</span>
              </div>
            </div>

            <Link
              href="/blog"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-500"
            >
              浏览所有面经文章 <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* 1 对 1 定制求职服务 */}
          <div className="rounded-3xl border border-gray-200 bg-gradient-to-br from-blue-900 to-gray-900 text-white p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">
                  1 对 1 定制辅导与模拟面试
                </h3>
              </div>
              <p className="mt-2 text-sm text-gray-300 leading-relaxed">
                由北美科技大厂在职工程师提供 1v1 Mock Interview、简历精修与技术深度复盘，助力通关秋招与全职面试。
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-lg bg-white/10 px-2.5 py-1 text-xs text-gray-200">
                  Resume Review
                </span>
                <span className="rounded-lg bg-white/10 px-2.5 py-1 text-xs text-gray-200">
                  Coding Mock
                </span>
                <span className="rounded-lg bg-white/10 px-2.5 py-1 text-xs text-gray-200">
                  System Design
                </span>
              </div>
            </div>

            <Link
              href="/contact"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-400 hover:text-amber-300"
            >
              立即咨询导师服务 <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
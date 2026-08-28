// app/(public)/profile/page.tsx

import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";

export const dynamic = "force-dynamic";

const ADMIN_EMAILS = ["admin@echointv.com", "shihaoy74@gmail.com"];

export default async function ProfilePage() {
  const session = await getCurrentUser();
  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
  });

  if (!user) {
    redirect("/login");
  }

  const isEmailAdmin = ADMIN_EMAILS.includes(user.email.toLowerCase().trim());
  const isAdmin = user.role === "ADMIN" || isEmailAdmin;

  if (isEmailAdmin && user.role !== "ADMIN") {
    await prisma.user.update({
      where: { id: user.id },
      data: { role: "ADMIN" },
    });
    user.role = "ADMIN";
  }

  // 1. 查询全部题目并进行大小写与中英文兼容统计
  const [allProblems, totalPosts] = await Promise.all([
    prisma.problem.findMany({ select: { difficulty: true } }),
    prisma.post.count(),
  ]);

  const totalProblems = allProblems.length;

  const isEasy = (d?: string) => {
    const s = d?.toLowerCase() || "";
    return s === "easy" || s.includes("简");
  };
  const isMedium = (d?: string) => {
    const s = d?.toLowerCase() || "";
    return s === "medium" || s.includes("中");
  };
  const isHard = (d?: string) => {
    const s = d?.toLowerCase() || "";
    return s === "hard" || s.includes("难");
  };

  const easyCount = allProblems.filter((p) => isEasy(p.difficulty)).length;
  const mediumCount = allProblems.filter((p) => isMedium(p.difficulty)).length;
  const hardCount = allProblems.filter((p) => isHard(p.difficulty)).length;

// 🌟 2. 精准计算 Pro 会员有效期与剩余天数（加入安全断言，消除 TS 报错）
  let proDetails: { isActive: boolean; text: string } | null = null;
  const userExpires = (user as any).proExpiresAt;

  if (user.role === "PRO" && userExpires) {
    const now = Date.now();
    const expiresTime = new Date(userExpires).getTime();
    const remainingDays = Math.ceil((expiresTime - now) / (1000 * 60 * 60 * 24));

    if (remainingDays > 0) {
      proDetails = {
        isActive: true,
        text: `有效期至：${new Date(userExpires).toLocaleDateString("zh-CN")}（剩余 ${remainingDays} 天）`,
      };
    } else {
      proDetails = {
        isActive: false,
        text: `已于 ${new Date(userExpires).toLocaleDateString("zh-CN")} 到期`,
      };
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* 用户资料卡 */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-600 text-white text-2xl font-bold flex items-center justify-center shadow-inner">
              {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-bold text-gray-900">
                  {user.name || user.email.split("@")[0]}
                </h1>

                {/* 🌟 动态会员身份与到期时间展示 */}
                {isAdmin ? (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                    👑 系统管理员 (Pro)
                  </span>
                ) : user.role === "PRO" && proDetails?.isActive !== false ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                      ⭐ EchoINTV Pro 会员
                    </span>
                    {proDetails?.text && (
                      <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                        {proDetails.text}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                      {proDetails ? "Pro 会员已过期" : "免费用户"}
                    </span>
                    <Link
                      href="/pricing"
                      className="text-xs text-blue-600 font-bold hover:underline"
                    >
                      {proDetails ? "立即续费 Pro →" : "升级 Pro →"}
                    </Link>
                  </div>
                )}
              </div>

              <p className="text-sm text-gray-500 mt-1">
                ✉ {user.email} · 加入时间：{new Date(user.createdAt).toLocaleDateString("zh-CN")}
              </p>
            </div>
          </div>

          {/* 右侧操作按钮组 */}
          <div className="flex items-center gap-3 flex-wrap">
            {isAdmin && (
              <Link
                href="/admin"
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-xl transition shadow-sm flex items-center gap-1.5"
              >
                <span>👑</span>
                <span>进入管理后台</span>
              </Link>
            )}

            <Link
              href="/problem"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition shadow-sm"
            >
              &lt;/&gt; 进入题库刷题
            </Link>
          </div>
        </div>

        {/* 题库大厂真题总览 */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span>📈</span> 题库大厂真题总览
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>真题总库</span>
                <span className="text-blue-600 font-mono">&lt;/&gt;</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {totalProblems} <span className="text-xs font-normal text-gray-400">道大厂真题</span>
              </div>
              <div className="w-full bg-blue-500 h-1.5 rounded-full" />
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>简单题 (Easy)</span>
                <span className="w-2 h-2 rounded-full bg-green-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {easyCount} <span className="text-xs font-normal text-gray-400">道基础题</span>
              </div>
              <div className="w-full bg-green-500 h-1.5 rounded-full" />
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>中等题 (Medium)</span>
                <span className="w-2 h-2 rounded-full bg-amber-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {mediumCount} <span className="text-xs font-normal text-gray-400">道高频题</span>
              </div>
              <div className="w-full bg-amber-500 h-1.5 rounded-full" />
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>困难题 (Hard)</span>
                <span className="w-2 h-2 rounded-full bg-rose-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {hardCount} <span className="text-xs font-normal text-gray-400">道挑战题</span>
              </div>
              <div className="w-full bg-rose-500 h-1.5 rounded-full" />
            </div>
          </div>
        </div>

        {/* 底部两列模块 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span>📖</span> 大厂面试经验与技术指南
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                收录了 Meta、Amazon、Google 等顶尖科技公司的真实面试真题还原、BQ 答题技巧与系统设计拆解。
              </p>
              <div className="pt-2">
                <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg">
                  已更新 {totalPosts} 篇深度求职面经
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <Link
                href="/blog"
                className="text-sm font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                浏览所有面经文章 →
              </Link>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                <span>✨</span> 1 对 1 定制辅导与模拟面试
              </h3>
              <p className="text-sm text-blue-100/80 leading-relaxed">
                由北美科技大厂在职工程师提供 1v1 Mock Interview、简历精修与技术深度复盘，助力通关秋招与全职面试。
              </p>
              <div className="flex flex-wrap gap-2 pt-2 text-xs">
                <span className="bg-white/10 px-2.5 py-1 rounded-md text-blue-200">
                  Resume Review
                </span>
                <span className="bg-white/10 px-2.5 py-1 rounded-md text-blue-200">
                  Coding Mock
                </span>
                <span className="bg-white/10 px-2.5 py-1 rounded-md text-blue-200">
                  System Design
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <Link
                href="/contact"
                className="text-sm font-semibold text-white hover:text-blue-200 transition inline-flex items-center gap-1"
              >
                立即咨询导师服务 →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
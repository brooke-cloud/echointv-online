// app/(public)/login/page.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "邮箱或密码错误");
      }

      // 登录成功，刷新并跳转
      router.push(redirectUrl);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "登录失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle =
    "mt-2 w-full rounded-xl border border-gray-700 bg-gray-800/80 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-950 px-4 py-12 sm:px-6 lg:px-8">
      {/* 🌟 核心黑色系登录卡片 */}
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-gray-800/90 bg-gray-900 p-8 shadow-2xl sm:p-10">
        
        {/* 头部标题区 */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            欢迎回来
          </h1>
          <p className="text-sm text-gray-400">
            登录您的 EchoINTV 账号继续备战面试
          </p>
        </div>

        {/* 错误提示条 */}
        {error && (
          <div className="rounded-xl border border-red-800/50 bg-red-950/60 p-3.5 text-center text-xs font-semibold text-red-400 animate-fade-in">
            {error}
          </div>
        )}

        {/* 登录表单 */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            {/* 邮箱地址 */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-gray-300 uppercase tracking-wider"
              >
                邮箱地址
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={inputStyle}
              />
            </div>

            {/* 密码 */}
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-gray-300 uppercase tracking-wider"
                >
                  密码
                </label>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputStyle}
              />
            </div>
          </div>

          {/* 登录提交按钮 */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50"
            >
              {loading ? "正在登录..." : "立即登录"}
            </button>
          </div>
        </form>

        {/* 底部跳转注册 */}
        <div className="pt-2 text-center text-xs text-gray-400">
          还没有账号？{" "}
          <Link
            href="/register"
            className="font-semibold text-blue-400 transition hover:text-blue-300 hover:underline"
          >
            免费注册
          </Link>
        </div>

      </div>
    </div>
  );
}
// app/(public)/login/page.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Lock, Mail, AlertCircle, Loader2 } from "lucide-react";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 监听 URL 中返回的错误信息（如 Google 登录返回的错误）
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }
  }, [searchParams]);

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
        throw new Error(data.error || "登录失败，请检查邮箱和密码");
      }

      // 登录成功强制进入首页并刷新会话
      window.location.href = "/";
    } catch (err: any) {
      setError(err.message || "登录异常，请稍后重试");
      setLoading(false);
    }
  };

  const inputStyle =
    "mt-2 block w-full rounded-xl border border-gray-700 bg-gray-800/90 py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-black px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-gray-800/90 bg-gray-900 p-8 sm:p-10 shadow-2xl">
        
        {/* 顶部标题 */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            欢迎回来
          </h1>
          <p className="text-sm text-gray-400">
            登录您的 EchoINTV 账号继续备战面试
          </p>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-900/60 bg-rose-950/60 p-4 text-sm text-rose-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 账号密码登录表单 */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* 邮箱 */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300">
              邮箱地址
            </label>
            <div className="relative mt-2">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={inputStyle}
              />
            </div>
          </div>

          {/* 密码 */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300">
              密码
            </label>
            <div className="relative mt-2">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputStyle}
              />
            </div>
          </div>

          {/* 立即登录按钮 */}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                正在登录...
              </>
            ) : (
              "立即登录"
            )}
          </button>
        </form>

        {/* 🌟 分割线 */}
        <div className="relative my-4 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-800"></div>
          </div>
          <span className="relative bg-gray-900 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
            或
          </span>
        </div>

        {/* 🌟 Google 一键登录按钮 */}
        <a
          href="/api/auth/google"
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-700/80 bg-gray-800/90 py-3.5 px-4 text-sm font-semibold text-white shadow-lg transition hover:bg-gray-700/90 hover:border-gray-600 active:scale-[0.99]"
        >
          <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>使用 Google 账号一键登录</span>
        </a>

        {/* 底部注册跳转 */}
        <div className="text-center border-t border-gray-800 pt-6">
          <p className="text-sm text-gray-400">
            还没有账号？{" "}
            <Link
              href="/register"
              className="font-semibold text-blue-400 hover:text-blue-300 hover:underline"
            >
              免费注册
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
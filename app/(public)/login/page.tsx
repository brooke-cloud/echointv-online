"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, AlertCircle, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
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
        setError(data.error || "登录失败，请检查账号和密码");
        setLoading(false);
        return;
      }

      // 登录成功，跳转到题目列表页并刷新状态
      router.push("/problem");
      router.refresh();
    } catch {
      setError("网络连接异常，请稍后重试");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-gray-200 bg-white p-8 sm:p-10 shadow-sm">
        
        {/* 顶部标题 */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">
            欢迎回到 Echo INTV
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            登录您的求职账户，继续练习大厂真题
          </p>
        </div>

        {/* 错误提示条 */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 登录表单 */}
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
              电子邮箱
            </label>
            <div className="relative mt-2">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="block w-full rounded-xl border border-gray-300 py-3 pl-10 pr-4 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                密码
              </label>
            </div>
            <div className="relative mt-2">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full rounded-xl border border-gray-300 py-3 pl-10 pr-4 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                正在登录...
              </>
            ) : (
              <>
                登 录
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* 底部注册指引 */}
        <div className="text-center border-t border-gray-100 pt-6">
          <p className="text-sm text-gray-600">
            还没有Echo INTV 账户？{" "}
            <Link
              href="/register"
              className="font-semibold text-blue-600 hover:text-blue-500 underline"
            >
              免费注册
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
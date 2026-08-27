// app/(public)/register/page.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  AlertCircle,
  Loader2,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // 验证码倒计时状态
  const [countdown, setCountdown] = useState(0);
  const [sendingCode, setSendingCode] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // 发送邮箱验证码
  const handleSendCode = async () => {
    if (!email || !email.includes("@")) {
      setError("请先输入有效的电子邮箱地址");
      return;
    }

    setError("");
    setSendingCode(true);

    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "验证码发送失败");
      }

      setSuccessMsg("验证码已发送至您的邮箱，10 分钟内有效！");
      setCountdown(60);
    } catch (err: any) {
      setError(err.message || "发送失败，请稍后重试");
    } finally {
      setSendingCode(false);
    }
  };

  // 提交注册表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!code || code.trim().length !== 6) {
      setError("请输入 6 位邮箱验证码");
      return;
    }

    if (password.length < 6) {
      setError("密码长度不能少于 6 个字符");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, code }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "注册失败，请稍后重试");
        setLoading(false);
        return;
      }

      setSuccessMsg("注册成功！正在为您进入系统...");
      setTimeout(() => {
        router.push("/problem");
        router.refresh();
      }, 1000);
    } catch {
      setError("网络连接异常，请稍后重试");
      setLoading(false);
    }
  };

  const inputStyle =
    "block w-full rounded-xl border border-gray-700 bg-gray-800/90 py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-black px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-gray-800/90 bg-gray-900 p-8 sm:p-10 shadow-2xl">
        
        {/* 顶部标题 */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            加入 Echo INTV
          </h1>
          <p className="text-sm text-gray-400">
            免费注册账户，开启大厂求职刷题与面经研读
          </p>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-900/60 bg-rose-950/60 p-4 text-sm text-rose-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 成功提示 */}
        {successMsg && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-900/60 bg-emerald-950/60 p-4 text-sm text-emerald-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 注册表单 */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* 昵称 */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300">
              昵称 / 姓名 (可选)
            </label>
            <div className="relative mt-2">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
                <User className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如：Alex"
                className={inputStyle}
              />
            </div>
          </div>

          {/* 邮箱 + 获取验证码 */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300">
              电子邮箱
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
                placeholder="name@example.com"
                className={`${inputStyle} pr-28`}
              />
              <button
                type="button"
                onClick={handleSendCode}
                disabled={sendingCode || countdown > 0}
                className="absolute right-2 top-2 rounded-lg bg-blue-600 hover:bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white transition disabled:opacity-40"
              >
                {sendingCode ? (
                  <span className="flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" /> 发送中
                  </span>
                ) : countdown > 0 ? (
                  `${countdown}s`
                ) : (
                  "获取验证码"
                )}
              </button>
            </div>
          </div>

          {/* 邮箱验证码 */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300">
              邮箱验证码  （如果没收到验证码，请查看垃圾邮件箱）
            </label>
            
            <div className="relative mt-2">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <input
                type="text"
                required
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="请输入 6 位数字验证码"
                className={`${inputStyle} font-mono tracking-widest text-base`}
              />
            </div>
          </div>

          {/* 密码 */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300">
              设置密码 (至少 6 位)
            </label>
            <div className="relative mt-2">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputStyle}
              />
            </div>
          </div>

          {/* 提交按钮 */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                正在注册并登录...
              </>
            ) : (
              <>
                创建账户
                <ArrowRight className="h-4 w-4" />
              </>
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

        {/* 🌟 Google 一键注册 / 登录按钮 */}
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
          <span>使用 Google 账号一键注册</span>
        </a>

        {/* 底部登录链接 */}
        <div className="text-center border-t border-gray-800 pt-6">
          <p className="text-sm text-gray-400">
            已经拥有 Echo INTV 账户？{" "}
            <Link
              href="/login"
              className="font-semibold text-blue-400 hover:text-blue-300 hover:underline"
            >
              直接登录
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
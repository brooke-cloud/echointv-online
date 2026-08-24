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
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-gray-800/90 bg-gray-900 p-8 sm:p-10 shadow-2xl">
        
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
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
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
              邮箱验证码
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
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50"
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
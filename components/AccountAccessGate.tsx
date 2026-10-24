import type { ReactNode } from "react";
import Link from "next/link";
import { LockKeyhole, LogIn, UserPlus } from "lucide-react";

type AccountAccessGateProps = {
  children: ReactNode;
  isAuthenticated: boolean;
  contentType: "problem" | "experience";
  returnPath: string;
};

export default function AccountAccessGate({ children, isAuthenticated, contentType, returnPath }: AccountAccessGateProps) {
  if (isAuthenticated) return <>{children}</>;

  const label = contentType === "problem" ? "题目" : "面经";
  const redirect = encodeURIComponent(returnPath);

  return (
    <main className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-slate-50">
      <div aria-hidden="true" className="pointer-events-none mx-auto max-w-6xl select-none px-4 py-10 opacity-45 blur-[7px] sm:px-6">
        <div className="h-8 w-32 rounded-lg bg-slate-300" />
        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
          <div className="h-9 w-2/3 rounded-lg bg-slate-300" />
          <div className="mt-5 h-4 w-full rounded bg-slate-200" />
          <div className="mt-3 h-4 w-11/12 rounded bg-slate-200" />
          <div className="mt-3 h-4 w-4/5 rounded bg-slate-200" />
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            <div className="h-48 rounded-2xl bg-slate-200" />
            <div className="h-48 rounded-2xl bg-slate-200" />
          </div>
          <div className="mt-6 h-56 rounded-2xl bg-slate-200" />
        </div>
      </div>

      <div className="absolute inset-0 z-20 flex items-start justify-center bg-white/30 px-4 pt-20 backdrop-blur-[2px] sm:pt-28">
        <section aria-labelledby="account-access-title" className="sticky top-24 w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-[0_24px_70px_rgba(15,23,42,0.18)] sm:p-9">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
            <LockKeyhole className="h-7 w-7" aria-hidden="true" />
          </div>
          <h1 id="account-access-title" className="mt-5 text-2xl font-extrabold tracking-tight text-slate-950">登录后查看完整{label}</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">为保护 EchoINTV 的面试内容，请登录已有账号，或免费注册后继续查看。</p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <Link href={`/login?redirect=${redirect}`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-sm font-bold text-slate-800 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
              <LogIn className="h-4 w-4" aria-hidden="true" />登录账号
            </Link>
            <Link href={`/register?redirect=${redirect}`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
              <UserPlus className="h-4 w-4" aria-hidden="true" />免费注册
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

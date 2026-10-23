"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Search, Shield, UserRound, X } from "lucide-react";
import { fetchJson } from "@/lib/fetch-json";
import { useLanguage } from "@/lib/use-language";

type UserSession = { id: string; email: string; name?: string | null; role: string };

export default function SaaSNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const [user, setUser] = useState<UserSession | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const copy = language === "en"
    ? {
        links: [
          ["Home", "/"],
          ["Interview Questions", "/problem"],
          ["Interview Experiences", "/blog"],
          ["Our Services", "/contact"],
        ],
        search: "Search",
        signIn: "Sign In",
        signUp: "Sign Up",
        dashboard: "Dashboard",
        profile: "Profile",
        logout: "Log out",
      }
    : {
        links: [["首页", "/"], ["面试真题", "/problem"], ["面试经验", "/blog"], ["我们的服务", "/contact"]],
        search: "搜索",
        signIn: "登录",
        signUp: "免费注册",
        dashboard: "管理后台",
        profile: "用户主页",
        logout: "退出",
      };

  useEffect(() => {
    let active = true;
    fetchJson<{ user: UserSession | null }>("/api/auth/me")
      .then((data) => { if (active) setUser(data.user); })
      .catch(() => { if (active) setUser(null); })
      .finally(() => { if (active) setAuthLoading(false); });
    return () => { active = false; };
  }, [pathname]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    setUser(null);
    router.push("/");
    router.refresh();
  };

  const isAdmin = user?.role === "ADMIN";

  return (
    <header className="site-navbar sticky top-0 z-50 w-full overflow-hidden border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 min-w-0 max-w-[1440px] items-center gap-5 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="EchoINTV home">
          <Image src="/logo.png" alt="EchoINTV" width={38} height={38} className="h-9 w-9 object-contain" priority />
          <div className="leading-none">
            <div className="text-xl font-black tracking-tight text-slate-950">Echo<span className="text-blue-600">INTV</span></div>
            <div className="mt-1 text-[10px] font-semibold tracking-wide text-slate-500">INTERVIEW INTELLIGENCE</div>
          </div>
        </Link>

        <nav className="mx-auto hidden items-center gap-1 rounded-2xl border border-slate-200/70 bg-slate-50/80 p-1 md:flex">
          {copy.links.map(([label, href]) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return <Link key={href} href={href} className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition ${active ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:bg-white hover:text-slate-950"}`}>{label}</Link>;
          })}
        </nav>

        <div className="hidden shrink-0 items-center gap-2 md:flex">
          <Link href="/problem" className="flex h-9 items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-medium text-slate-500 hover:border-blue-200 hover:text-blue-600">
            <Search className="h-3.5 w-3.5" /> {copy.search}
          </Link>
          <div className="flex rounded-xl bg-slate-100 p-1 text-[11px] font-bold">
            <button onClick={() => setLanguage("en")} className={`rounded-lg px-2 py-1.5 ${language === "en" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"}`}>EN</button>
            <button onClick={() => setLanguage("zh")} className={`rounded-lg px-2 py-1.5 ${language === "zh" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"}`}>中文</button>
          </div>
          {!authLoading && (user ? (
            <>
              {isAdmin && <Link href="/admin" className="flex h-9 items-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 px-3 text-xs font-bold text-violet-700"><Shield className="h-3.5 w-3.5" />{copy.dashboard}</Link>}
              <Link href="/profile" className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"><UserRound className="h-3.5 w-3.5" />{copy.profile}</Link>
              <button onClick={logout} className="px-2 text-xs font-semibold text-slate-500 hover:text-slate-900">{copy.logout}</button>
            </>
          ) : (
            <>
              <Link href="/login" className="px-2 text-xs font-bold text-slate-700">{copy.signIn}</Link>
              <Link href="/register" className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">{copy.signUp}</Link>
            </>
          ))}
        </div>

        <button onClick={() => setMenuOpen((open) => !open)} className="fixed right-4 top-3 rounded-xl border border-slate-200 bg-white p-2 shadow-sm md:hidden" aria-label="Toggle navigation">
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-slate-100 bg-white px-4 py-4 md:hidden">
          <nav className="grid gap-1">
            {copy.links.map(([label, href]) => <Link onClick={() => setMenuOpen(false)} key={href} href={href} className="rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">{label}</Link>)}
          </nav>
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-4">
            <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
              <button onClick={() => setLanguage("en")} className={`rounded-lg px-3 py-1.5 ${language === "en" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"}`}>EN</button>
              <button onClick={() => setLanguage("zh")} className={`rounded-lg px-3 py-1.5 ${language === "zh" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"}`}>中文</button>
            </div>
            {user ? <div className="flex gap-2"><Link onClick={() => setMenuOpen(false)} href="/profile" className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700"><UserRound className="h-4 w-4" />{copy.profile}</Link>{isAdmin && <Link onClick={() => setMenuOpen(false)} href="/admin" className="inline-flex items-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-sm font-bold text-violet-700"><Shield className="h-4 w-4" />{copy.dashboard}</Link>}</div> : <div className="flex gap-2"><Link href="/login" className="px-3 py-2 text-sm font-bold">{copy.signIn}</Link><Link href="/register" className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white">{copy.signUp}</Link></div>}
          </div>
        </div>
      )}
    </header>
  );
}

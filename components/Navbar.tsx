// components/Navbar.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Menu,
  X,
  User,
  Shield,
  LogOut,
  ChevronRight,
  Sparkles,
  Code2,
  Flame,
} from "lucide-react";

interface UserSession {
  id: string;
  email: string;
  name?: string | null;
  role: string;
}

const ADMIN_EMAILS = ["admin@echointv.com", "shihaoy74@gmail.com"];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user || null);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setMobileMenuOpen(false);
      router.push("/");
      router.refresh();
    } catch (e) {
      console.error("Logout error:", e);
    }
  };

  const isEmailAdmin =
    user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase().trim());
  const isAdmin = user?.role === "ADMIN" || isEmailAdmin;

  // 🌟 核心：将“大厂招聘”置于“面试真题”前面，并增加动态热度标记
  const navLinks = [
    { name: "首页", href: "/" },
    { name: "大厂招聘", href: "/jobs", isHot: true },
    { name: "面试真题", href: "/problem" },
    { name: "面试经验", href: "/blog" },
    { name: "我们的服务", href: "/contact" },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-gray-100/90 bg-white/90 backdrop-blur-md transition-all">
        <div className="mx-auto flex h-18 sm:h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* 🌟 1. Logo 品牌区 */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0 group">
            {!logoError ? (
              <Image
                src="/logo.png"
                alt="Echo INTV Logo"
                width={52}
                height={52}
                className="h-10 w-10 sm:h-12 sm:w-12 object-contain transition-transform duration-200 group-hover:scale-105"
                onError={() => setLogoError(true)}
                priority
              />
            ) : (
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 transition-transform duration-200 group-hover:scale-105">
                <Code2 className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
            )}
            <span className="text-xl sm:text-2xl font-black tracking-tight text-gray-900">
              Echo<span className="text-blue-600">INTV</span>
            </span>
          </Link>

          {/* 🌟 2. 桌面端精致胶囊导航栏（大厂招聘前置 + UI 优化） */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2 bg-gray-50/80 p-1.5 rounded-2xl border border-gray-200/50">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-white text-blue-600 font-bold shadow-xs border border-gray-100"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/60"
                  }`}
                >
                  <span>{link.name}</span>

                  {/* HOT 小角标 */}
                  {link.isHot && (
                    <span className="ml-1.5 text-[10px] font-extrabold px-1.5 py-0.2 rounded-md bg-rose-50 text-rose-600 border border-rose-100 leading-none">
                      HOT
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* 🌟 3. 桌面端用户状态区 */}
          <div className="hidden md:flex items-center gap-3">
            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center gap-3">
                    {/* 管理员入口 */}
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200/80 hover:bg-purple-100 transition shadow-sm active:scale-95"
                      >
                        <Shield className="h-3.5 w-3.5" />
                        <span>管理后台</span>
                      </Link>
                    )}

                    {/* 个人中心入口 */}
                    <Link
                      href="/profile"
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-gray-200/90 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 transition shadow-sm active:scale-95"
                    >
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white font-bold">
                        {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
                      </div>
                      <span className="max-w-[100px] truncate">
                        {user.name || user.email.split("@")[0]}
                      </span>
                    </Link>

                    {/* 退出按钮 */}
                    <button
                      onClick={handleLogout}
                      className="text-xs text-gray-400 hover:text-gray-600 font-medium transition px-1"
                    >
                      退出
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5">
                    <Link
                      href="/login"
                      className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-blue-600 transition"
                    >
                      登录
                    </Link>
                    <Link
                      href="/register"
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-500/20 transition active:scale-95"
                    >
                      免费注册
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>

          {/* 🌟 4. 移动端汉堡菜单按钮 */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-gray-700 hover:bg-gray-100 focus:outline-none transition active:scale-95"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-900" />
              ) : (
                <Menu className="h-6 w-6 text-gray-900" />
              )}
            </button>
          </div>

        </div>
      </header>

      {/* 🌟 5. 移动端全屏滑出式抽屉菜单 */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden animate-fadeIn">
          {/* 背景遮罩 */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* 抽屉内容主体 */}
          <div className="fixed inset-y-0 right-0 w-4/5 max-w-sm bg-white shadow-2xl flex flex-col justify-between p-6 z-50 overflow-y-auto">
            <div className="space-y-6">
              
              {/* 抽屉头部 */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  {!logoError ? (
                    <Image
                      src="/logo.png"
                      alt="Logo"
                      width={38}
                      height={38}
                      className="h-9 w-9 object-contain"
                      onError={() => setLogoError(true)}
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
                      <Code2 className="h-5 w-5" />
                    </div>
                  )}
                  <span className="font-black text-gray-900 text-lg">
                    Echo<span className="text-blue-600">INTV</span>
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* 移动端主导航链接 */}
              <nav className="space-y-1.5">
                {navLinks.map((link) => {
                  const isActive =
                    link.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(link.href);

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center justify-between px-4 py-3.5 rounded-2xl text-base font-bold transition ${
                        isActive
                          ? "bg-blue-50 text-blue-600 font-extrabold"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{link.name}</span>
                        {link.isHot && (
                          <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-md bg-rose-50 text-rose-600 border border-rose-100">
                            HOT
                          </span>
                        )}
                      </div>
                      <ChevronRight className={`h-4 w-4 ${isActive ? "text-blue-600" : "text-gray-300"}`} />
                    </Link>
                  );
                })}
              </nav>

              {/* VIP 专区卡片 */}
              <div className="pt-2">
                <Link
                  href="/pricing"
                  className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-200/80 text-amber-900 shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-bold">解锁 Pro 会员专区</span>
                  </div>
                  <span className="text-xs font-extrabold text-amber-600">¥69/月 ➔</span>
                </Link>
              </div>
            </div>

            {/* 抽屉底部用户账户区 */}
            <div className="pt-6 border-t border-gray-100 space-y-3">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-sm shadow-inner">
                      {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-gray-900 truncate">
                        {user.name || user.email.split("@")[0]}
                      </div>
                      <div className="text-xs text-gray-400 truncate font-mono">
                        {user.email}
                      </div>
                    </div>
                  </div>

                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex w-full items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-purple-600 text-white text-sm font-bold shadow transition active:scale-95"
                    >
                      <Shield className="h-4 w-4" />
                      <span>👑 进入管理后台</span>
                    </Link>
                  )}

                  <Link
                    href="/profile"
                    className="flex w-full items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-gray-200 bg-white text-gray-800 text-sm font-bold hover:bg-gray-50 shadow-sm transition"
                  >
                    <User className="h-4 w-4 text-gray-500" />
                    <span>👤 个人中心</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-gray-400 hover:text-red-600 transition"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>退出登录</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/register"
                    className="flex w-full items-center justify-center px-4 py-3.5 rounded-2xl bg-blue-600 text-white text-sm font-bold shadow-md transition active:scale-95"
                  >
                    免费注册账户
                  </Link>
                  <Link
                    href="/login"
                    className="flex w-full items-center justify-center px-4 py-3.5 rounded-2xl border border-gray-200 bg-white text-gray-700 text-sm font-bold hover:bg-gray-50 transition"
                  >
                    登录已有账号
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}
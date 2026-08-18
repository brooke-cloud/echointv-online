"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User, LogOut, Code2, Menu, X } from "lucide-react";

type CurrentUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 页面加载或路由跳转时拉取当前登录用户信息
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null));
  }, [pathname]);

  // 退出登录
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  };

  const navLinks = [
    { name: "首页", href: "/" },
    { name: "面试真题", href: "/problem" },
    { name: "面试经验", href: "/blog" },
    { name: "我们的服务", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        
        {/* 左侧 Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-600/30">
            <Code2 className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">
            EchoINTV
          </span>
        </Link>

        {/* 中间桌面导航链接 */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition hover:text-blue-600 ${
                  isActive ? "font-semibold text-blue-600" : ""
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* 右侧用户状态与操作区 */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            /* 已登录状态：点击跳转个人中心 */
            <div className="flex items-center gap-3">
              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-xl bg-gray-50 border border-gray-200 px-3 py-1.5 text-xs text-gray-700 transition hover:border-blue-300 hover:bg-blue-50/50"
                title="进入个人中心"
              >
                <User className="h-4 w-4 text-blue-600" />
                <span className="font-semibold">{user.name || user.email.split("@")[0]}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 transition hover:text-rose-600"
                title="退出登录"
              >
                <LogOut className="h-3.5 w-3.5" />
                退出
              </button>
            </div>
          ) : (
            /* 未登录状态 */
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-semibold text-gray-700 transition hover:text-blue-600 px-3 py-2"
              >
                登录
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500"
              >
                免费注册
              </Link>
            </div>
          )}
        </div>

        {/* 移动端汉堡菜单按钮 */}
        <div className="flex md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

      </div>

      {/* 移动端下拉抽屉菜单 */}
      {mobileMenuOpen && (
        <div className="border-b border-gray-200 bg-white px-4 pt-2 pb-6 md:hidden">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600"
              >
                {link.name}
              </Link>
            ))}

            <div className="border-t border-gray-100 pt-4">
              {user ? (
                <div className="flex items-center justify-between px-3">
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600"
                  >
                    <User className="h-4 w-4 text-blue-600" />
                    <span>{user.name || user.email}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-sm font-medium text-rose-600"
                  >
                    退出登录
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-700"
                  >
                    登录
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white"
                  >
                    免费注册
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
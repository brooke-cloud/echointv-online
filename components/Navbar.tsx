// components/Navbar.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const ADMIN_EMAILS = ["admin@echointv.com", "shihaoy74@gmail.com"];

interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        setUser(data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [pathname]);

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

  // 判定是否为管理员
  const isAdmin =
    user?.role === "ADMIN" ||
    (user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase().trim()));

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo 与菜单 */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gray-900">
            <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-mono text-sm">
              &lt;/&gt;
            </span>
            <span>EchoINTV</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition ${
                    isActive ? "text-blue-600 font-semibold" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* 用户操作区 */}
        <div className="flex items-center gap-4">
          {loading ? (
            <div className="w-20 h-8 bg-gray-100 animate-pulse rounded-lg" />
          ) : user ? (
            <div className="flex items-center gap-3">
              {/* 👑 管理员专属快捷按钮 */}
              {isAdmin && (
                <Link
                  href="/admin"
                  className="text-xs font-bold px-3 py-1.5 rounded-xl bg-purple-600 text-white hover:bg-purple-700 shadow-sm transition flex items-center gap-1.5"
                >
                  <span>👑</span>
                  <span>管理后台</span>
                </Link>
              )}

              {/* 👤 个人中心入口 */}
              <Link
                href="/profile"
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-gray-50"
              >
                <span>👤</span>
                <span>个人中心</span>
              </Link>

              <button
                onClick={handleLogout}
                className="text-xs px-3 py-1.5 border border-gray-200 text-gray-600 hover:text-red-600 hover:border-red-200 rounded-lg transition"
              >
                退出
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-gray-700 hover:text-gray-900 px-3 py-2"
              >
                登录
              </Link>
              <Link
                href="/register"
                className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg shadow-sm transition"
              >
                免费注册
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
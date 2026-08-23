// components/AdminSidebar.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  name: string;
  href: string;
  icon: string;
}

export default function AdminSidebar() {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: "📊",
    },
    {
      name: "Problems (题库管理)",
      href: "/admin/problems",
      icon: "💻",
    },
    {
      name: "Blog Posts (面经文章)",
      href: "/admin/posts",
      icon: "📝",
    },
    {
      name: "Users (用户与会员)",
      href: "/admin/users",
      icon: "👥",
    },
  ];

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col justify-between p-4 sm:p-6 shrink-0">
      <div className="space-y-8">
        {/* Logo 区域 */}
        <div className="flex items-center gap-2.5 px-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-lg shadow-sm">
            E
          </span>
          <div>
            <h2 className="text-base font-bold text-gray-900 leading-tight">
              Echo INTV
            </h2>
            <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">
              Admin Panel
            </span>
          </div>
        </div>

        {/* 导航链接列表 */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            // 判断当前路径是否激活
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-blue-50 text-blue-600 font-semibold shadow-xs"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* 底部：返回前台首页 */}
      <div className="pt-4 border-t border-gray-100">
        <Link
          href="/"
          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition"
        >
          <span>←</span>
          <span>Back to Website (返回前台)</span>
        </Link>
      </div>
    </aside>
  );
}
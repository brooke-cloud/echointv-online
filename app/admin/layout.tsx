// app/admin/layout.tsx
import "katex/dist/katex.min.css";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen, Code2, Download, FileText, LayoutDashboard, Menu, ShieldCheck, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";

const ADMIN_EMAILS = ["admin@echointv.com", "shihaoy74@gmail.com"];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 🌟 1. 直接读取当前前台的登录会话（免二次登录）
  const session = await getCurrentUser();
  if (!session) {
    redirect("/login?redirect=/admin");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
  });

  if (!user) {
    redirect("/login?redirect=/admin");
  }

  const isEmailAdmin = ADMIN_EMAILS.includes(user.email.toLowerCase().trim());
  const isAdmin = user.role === "ADMIN" || isEmailAdmin;

  // 自动确保数据库角色为 ADMIN
  if (isEmailAdmin && user.role !== "ADMIN") {
    await prisma.user.update({
      where: { id: user.id },
      data: { role: "ADMIN" },
    });
  }

  // 非管理员拦截回首页
  if (!isAdmin) {
    redirect("/");
  }

  // 🌟 侧边栏导航列表（已加入“用户管理”）
  const navItems = [
    { name: "数据大盘", href: "/admin", icon: LayoutDashboard },
    { name: "题库管理", href: "/admin/problems", icon: BookOpen },
    { name: "面经管理", href: "/admin/posts", icon: FileText },
    { name: "Interview Import", href: "/admin/ai-import", icon: Download },
    { name: "用户管理", href: "/admin/users", icon: Users },
  ];

  return (
    <div className="admin-shell flex min-h-screen bg-[var(--surface-muted)]">
      {/* 侧边栏 */}
      <aside className="hidden w-64 flex-shrink-0 flex-col justify-between bg-gray-900 text-white lg:flex">
        <div>
          <div className="h-16 flex items-center gap-3 px-6 border-b border-gray-800">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Code2 className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="leading-tight">
              <div className="font-bold text-sm tracking-wide">EchoINTV</div>
              <div className="text-[10px] font-semibold tracking-wide text-gray-400">ADMIN CMS</div>
            </div>
          </div>

          <nav className="p-4 space-y-1">
            {navItems.filter((item) => item.href !== "/admin/ai-import").map((item) => {
              const Icon = item.icon;
              return <Link key={item.href} href={item.href} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition">
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span>{item.name}</span>
              </Link>;
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-800 space-y-2">
          <div className="px-4 py-2 text-xs text-gray-400">
            当前管理员：<br />
            <span className="break-all text-gray-200">{user.email}</span>
          </div>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-200 transition"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> 返回前台网站
          </Link>
        </div>
      </aside>

      {/* 主工作区 */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between border-b border-gray-200 bg-white px-4 py-3 sm:px-6 lg:px-8">
          <details className="group relative lg:hidden">
            <summary className="flex cursor-pointer list-none items-center gap-2 rounded-[var(--radius-control)] border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 marker:content-none">
              <Menu className="h-4 w-4" aria-hidden="true" />
              管理菜单
            </summary>
            <nav className="absolute left-0 top-[calc(100%+0.5rem)] z-50 w-64 rounded-[var(--radius-panel)] border border-gray-200 bg-white p-2 shadow-[var(--shadow-dialog)]">
              {navItems.filter((item) => item.href !== "/admin/ai-import").map((item) => {
                const Icon = item.icon;
                return <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-[var(--radius-control)] px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  <span>{item.name}</span>
                </Link>;
              })}
              <Link href="/" className="mt-1 flex items-center gap-2 rounded-[var(--radius-control)] border-t border-gray-100 px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                返回前台网站
              </Link>
            </nav>
          </details>
          <h2 className="text-lg font-bold text-gray-800">控制台管理中心</h2>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 sm:inline-flex">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> 系统管理员
            </span>
          </div>
        </header>

        <main className="admin-main overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

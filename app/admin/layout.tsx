// app/admin/layout.tsx
import "katex/dist/katex.min.css";
import { redirect } from "next/navigation";
import Link from "next/link";
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
    { name: "数据大盘", href: "/admin", icon: "📊" },
    { name: "题库管理", href: "/admin/problems", icon: "📚" },
    { name: "面经管理", href: "/admin/posts", icon: "📝" },
    { name: "用户管理", href: "/admin/users", icon: "👥" }, // 🌟 新增用户与会员管理菜单
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* 侧边栏 */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col justify-between flex-shrink-0">
        <div>
          <div className="h-16 flex items-center gap-3 px-6 border-b border-gray-800">
            <span className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-mono font-bold text-sm">
              &lt;/&gt;
            </span>
            <div className="leading-tight">
              <div className="font-bold text-sm tracking-wide">EchoINTV</div>
              <div className="text-[10px] text-gray-400 font-mono">ADMIN CMS</div>
            </div>
          </div>

          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition"
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-800 space-y-2">
          <div className="px-4 py-2 text-xs text-gray-400">
            当前管理员：<br />
            <span className="font-mono text-gray-200">{user.email}</span>
          </div>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-200 transition"
          >
            ← 返回前台网站
          </Link>
        </div>
      </aside>

      {/* 主工作区 */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <h2 className="text-lg font-bold text-gray-800">控制台管理中心</h2>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              👑 系统管理员
            </span>
          </div>
        </header>

        <main className="p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
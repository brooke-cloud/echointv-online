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
  const session = await getCurrentUser();
  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
  });

  const isEmailAdmin = user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase().trim());
  const isAdmin = user?.role === "ADMIN" || isEmailAdmin;

  // 非管理员禁止访问后台，直接重定向回首页
  if (!isAdmin) {
    redirect("/");
  }

  const navItems = [
    { name: "数据大盘", href: "/admin", icon: "📊" },
    { name: "题库管理", href: "/admin/problems", icon: "📚" },
    { name: "面经管理", href: "/admin/posts", icon: "📝" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* 侧边栏 */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col justify-between flex-shrink-0">
        <div>
          {/* 后台 Logo */}
          <div className="h-16 flex items-center gap-3 px-6 border-b border-gray-800">
            <span className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-mono font-bold text-sm">
              &lt;/&gt;
            </span>
            <div className="leading-tight">
              <div className="font-bold text-sm tracking-wide">EchoINTV</div>
              <div className="text-[10px] text-gray-400 font-mono">ADMIN CMS</div>
            </div>
          </div>

          {/* 导航菜单 */}
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

        {/* 底部返回前台 */}
        <div className="p-4 border-t border-gray-800 space-y-2">
          <div className="px-4 py-2 text-xs text-gray-400">
            当前管理员：<br />
            <span className="font-mono text-gray-200">{user?.email}</span>
          </div>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-200 transition"
          >
            ← 返回前台网站
          </Link>
        </div>
      </aside>

      {/* 右侧主内容区域 */}
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
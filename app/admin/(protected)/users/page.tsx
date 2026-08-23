// app/admin/(protected)/users/page.tsx

import { prisma } from "@/lib/prisma";
import UserVipToggle from "./UserVipToggle";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  // 统计 Pro 会员人数
  const proCount = users.filter((u) => u.role === "PRO" || (u as any).isVip).length;

  return (
    <main className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* 顶部标题与数据概览 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-8 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 border border-blue-100">
              共 {users.length} 个账户
            </span>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
              Pro 会员: {proCount} 人
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            管理全站注册用户，支持一键开通 VIP 或取消 VIP 会员资格。
          </p>
        </div>
      </div>

      {/* 用户列表表格 */}
      <div className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {users.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-gray-400 text-sm">暂无注册用户。</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/75 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-4">User / Email</th>
                  <th className="px-6 py-4">Current Status (当前身份)</th>
                  <th className="px-6 py-4">Registered Date</th>
                  <th className="px-6 py-4 text-right">Action (会员操作)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {users.map((user) => {
                  // 🌟 自动识别 PRO 或 isVip
                  const isVip = user.role === "PRO" || Boolean((user as any).isVip);

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50/80 transition-colors"
                    >
                      {/* 用户名与邮箱 */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">
                          {user.name || "User"}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {user.email}
                        </div>
                      </td>

                      {/* 当前身份 */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.role === "ADMIN" ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                            🛡️ ADMIN
                          </span>
                        ) : isVip ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            👑 PRO 会员
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            普通用户 (Free)
                          </span>
                        )}
                      </td>

                      {/* 注册时间 */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "-"}
                      </td>

                      {/* 🌟 一键开通 / 取消 VIP */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <UserVipToggle
                          userId={user.id}
                          isVip={isVip}
                          role={user.role}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
// app/admin/(protected)/users/page.tsx (或 app/admin/users/page.tsx)

import { prisma } from "@/lib/prisma";
import UserProManager from "@/components/admin/UserProManager";

export const dynamic = "force-dynamic";

// 🌟 会员剩余天数与起止状态计算
function getProStatusInfo(user: any) {
  if (user.role === "ADMIN") {
    return { text: "永久有效", color: "bg-purple-50 text-purple-700 border-purple-200" };
  }

  const userExpires = (user as any).proExpiresAt;
  if (user.role !== "PRO" || !userExpires) {
    return null;
  }

  const now = new Date().getTime();
  const expires = new Date(userExpires).getTime();
  const diffDays = Math.ceil((expires - now) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return {
      text: "已过期",
      daysText: `于 ${new Date(userExpires).toLocaleDateString("zh-CN")} 到期`,
      color: "bg-red-50 text-red-700 border-red-200",
    };
  }

  return {
    text: `剩余 ${diffDays} 天`,
    daysText: `到期: ${new Date(userExpires).toLocaleDateString("zh-CN")}`,
    color:
      diffDays <= 7
        ? "bg-amber-50 text-amber-800 border-amber-200"
        : "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
}

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  const proCount = users.filter((u) => u.role === "PRO").length;

  return (
    <div className="space-y-6">
      {/* 顶部标题与统计 */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-extrabold text-gray-900">User Management</h1>
          <span className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-full border border-blue-100">
            共 {users.length} 个账户
          </span>
          <span className="bg-amber-50 text-amber-800 text-xs font-bold px-3 py-1 rounded-full border border-amber-200">
            Pro 会员: {proCount} 人
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          管理全站注册用户，支持一键开通/取消 VIP 会员资格，以及彻底清理与删除用户账号。
        </p>
      </div>

      {/* 用户数据表（对齐第二张图样式，并加入会员起止时间） */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-100 text-sm">
          <thead className="bg-gray-50/80 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 text-left">USER / EMAIL</th>
              <th className="px-6 py-4 text-left">CURRENT STATUS (当前身份)</th>
              <th className="px-6 py-4 text-left">MEMBERSHIP DURATION (会员有效期)</th>
              <th className="px-6 py-4 text-left">REGISTERED DATE</th>
              <th className="px-6 py-4 text-right">ACTION (操作管理)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {users.map((u) => {
              const statusInfo = getProStatusInfo(u);

              return (
                <tr key={u.id} className="hover:bg-gray-50/70 transition">
                  {/* 用户/邮箱 */}
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{u.name || u.email.split("@")[0]}</div>
                    <div className="text-xs text-gray-400 font-mono">{u.email}</div>
                  </td>

                  {/* 当前身份 */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {u.role === "ADMIN" ? (
                      <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                        🛡️ ADMIN
                      </span>
                    ) : u.role === "PRO" ? (
                      <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        👑 PRO 会员
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                        普通用户 (Free)
                      </span>
                    )}
                  </td>

                  {/* 🌟 会员起止时间与剩余天数 */}
                  <td className="px-6 py-4 whitespace-nowrap text-xs">
                    {statusInfo ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded-md font-bold border ${statusInfo.color}`}>
                            {statusInfo.text}
                          </span>
                        </div>
                        {statusInfo.daysText && (
                          <div className="text-gray-500 font-mono text-[11px]">
                            {statusInfo.daysText}
                          </div>
                        )}
                        {(u as any).proStartedAt && (
                          <div className="text-gray-400 font-mono text-[11px]">
                            开通: {new Date((u as any).proStartedAt).toLocaleDateString("zh-CN")}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 font-mono">-</span>
                    )}
                  </td>

                  {/* 注册时间 */}
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-mono">
                    {new Date(u.createdAt).toLocaleDateString("zh-CN")}
                  </td>

                  {/* 🌟 完整操作：设为 VIP、续费/设天数、取消 VIP、删除用户 */}
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <UserProManager user={u} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
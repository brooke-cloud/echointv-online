// components/admin/UserProManager.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface UserProManagerProps {
  user: {
    id: string;
    email: string;
    name?: string | null;
    role: string;
    proStartedAt?: Date | string | null;
    proExpiresAt?: Date | string | null;
  };
}

export default function UserProManager({ user }: UserProManagerProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [days, setDays] = useState("30");
  const [customDays, setCustomDays] = useState("");
  const [loading, setLoading] = useState(false);

  const isPro = user.role === "PRO";
  const isAdmin = user.role === "ADMIN";

  if (isAdmin) {
    return <span className="text-xs text-gray-400 font-medium">系统管理员</span>;
  }

  // 1. 设置会员天数
  const handleSetPro = async () => {
    const finalDays = customDays.trim() ? customDays.trim() : days;
    const num = parseInt(finalDays, 10);
    if (isNaN(num) || num <= 0) {
      alert("请输入有效的天数");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/set-pro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set", days: num }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "设置失败");

      setShowModal(false);
      setCustomDays("");
      router.refresh();
    } catch (err: any) {
      alert(err.message || "网络请求异常");
    } finally {
      setLoading(false);
    }
  };

  // 2. 取消会员
  const handleRevokePro = async () => {
    if (!confirm(`确定要取消用户 ${user.email} 的 Pro 会员资格吗？`)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/set-pro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "revoke" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "取消失败");

      router.refresh();
    } catch (err: any) {
      alert(err.message || "操作失败");
    } finally {
      setLoading(false);
    }
  };

  // 3. 删除用户
  const handleDeleteUser = async () => {
    if (!confirm(`⚠️ 警告：确定要彻底删除用户【${user.email}】吗？此操作不可恢复！`)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "删除失败");

      router.refresh();
    } catch (err: any) {
      alert(err.message || "删除异常");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-end gap-2.5">
        {/* 开通 / 调整天数按钮 */}
        {isPro ? (
          <button
            onClick={() => setShowModal(true)}
            className="px-3 py-1 text-xs font-bold rounded-lg border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 transition shadow-sm"
          >
            ⚡ 续费 / 设天数
          </button>
        ) : (
          <button
            onClick={() => setShowModal(true)}
            className="px-3 py-1 text-xs font-bold rounded-lg border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 transition shadow-sm"
          >
            👑 设为 VIP (Pro)
          </button>
        )}

        {/* 取消会员按钮 */}
        {isPro && (
          <button
            onClick={handleRevokePro}
            disabled={loading}
            className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:text-white border border-rose-200 hover:bg-rose-600 rounded-lg transition"
          >
            ✕ 取消 VIP
          </button>
        )}

        {/* 删除用户按钮 */}
        <button
          onClick={handleDeleteUser}
          disabled={loading}
          className="px-2.5 py-1 text-xs font-semibold text-red-500 hover:text-red-700 bg-red-50/50 hover:bg-red-50 border border-red-100 rounded-lg transition flex items-center gap-1"
        >
          <span>🗑️</span>
          <span>删除</span>
        </button>
      </div>

      {/* 🌟 弹出设置会员天数弹窗 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm text-left">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-5 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  {isPro ? "续费 / 设置会员天数" : "开通 Pro 会员"}
                </h3>
                <p className="text-xs text-gray-500 font-mono mt-0.5">{user.email}</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-base w-7 h-7 rounded-full flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* 预设快捷天数 */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700 uppercase">
                快捷选择时长
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "30 天 (月卡)", val: "30" },
                  { label: "90 天 (季卡)", val: "90" },
                  { label: "365 天 (年卡)", val: "365" },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => {
                      setDays(item.val);
                      setCustomDays("");
                    }}
                    className={`py-2 px-1 text-xs font-bold rounded-xl border transition ${
                      days === item.val && !customDays
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 自定义天数输入 */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase">
                或自定义天数
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="3650"
                  value={customDays}
                  onChange={(e) => setCustomDays(e.target.value)}
                  placeholder="例如: 7, 15, 60, 100..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
                <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-medium">
                  天
                </span>
              </div>
            </div>

            {/* 确认操作按钮 */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSetPro}
                disabled={loading}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition disabled:opacity-50"
              >
                {loading ? "正在保存..." : "确认 ➔"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
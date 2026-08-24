// app/admin/(protected)/users/UserVipToggle.tsx

"use client";

import { useTransition } from "react";
import { toggleUserVip, deleteUser } from "./actions";

interface UserVipToggleProps {
  userId: string;
  isVip: boolean;
  role: string;
  email?: string;
}

export default function UserVipToggle({ userId, isVip, role, email }: UserVipToggleProps) {
  const [isPending, startTransition] = useTransition();

  // 系统管理员不显示任何操作按钮
  if (role === "ADMIN") {
    return (
      <span className="text-xs font-semibold text-gray-400">
        系统管理员
      </span>
    );
  }

  // 切换 VIP
  const handleToggleVip = () => {
    const actionText = isVip
      ? "取消该用户的 VIP 会员资格（降级为普通用户）"
      : "为该用户开通 VIP (Pro) 会员资格";

    if (!confirm(`确定要${actionText}吗？`)) return;

    startTransition(async () => {
      try {
        await toggleUserVip(userId, isVip);
      } catch (err: any) {
        alert(err.message || "操作失败，请重试");
      }
    });
  };

  // 🌟 删除账号
  const handleDeleteUser = () => {
    const confirmMsg = `⚠️ 警告：确定要彻底删除用户账号【${email || userId}】吗？\n\n此操作将同时清除该用户的所有刷题进度与收藏数据，且不可恢复！`;

    if (!confirm(confirmMsg)) return;

    startTransition(async () => {
      try {
        await deleteUser(userId);
      } catch (err: any) {
        alert(err.message || "删除失败，请重试");
      }
    });
  };

  return (
    <div className="inline-flex items-center gap-2">
      {/* 1. VIP 开通 / 取消按钮 */}
      <button
        type="button"
        onClick={handleToggleVip}
        disabled={isPending}
        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition disabled:opacity-50 ${
          isVip
            ? "bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200"
            : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
        }`}
      >
        {isPending ? (
          <span>处理中...</span>
        ) : isVip ? (
          <span>❌ 取消 VIP</span>
        ) : (
          <span>👑 设为 VIP (Pro)</span>
        )}
      </button>

      {/* 🌟 2. 删除账号按钮 */}
      <button
        type="button"
        onClick={handleDeleteUser}
        disabled={isPending}
        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-50 text-red-600 hover:bg-red-50 hover:text-red-700 border border-gray-200 hover:border-red-200 transition disabled:opacity-50"
      >
        <span>🗑️ 删除</span>
      </button>
    </div>
  );
}
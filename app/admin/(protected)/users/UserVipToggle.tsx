// app/admin/(protected)/users/UserVipToggle.tsx

"use client";

import { useTransition } from "react";
import { toggleUserVip } from "./actions";

interface UserVipToggleProps {
  userId: string;
  isVip: boolean;
  role: string;
}

export default function UserVipToggle({ userId, isVip, role }: UserVipToggleProps) {
  const [isPending, startTransition] = useTransition();

  // 系统管理员不显示切换按钮
  if (role === "ADMIN") {
    return (
      <span className="text-xs font-semibold text-gray-400">
        系统管理员
      </span>
    );
  }

  const handleToggle = () => {
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

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition disabled:opacity-50 ${
        isVip
          ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
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
  );
}
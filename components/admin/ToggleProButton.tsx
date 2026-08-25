// components/admin/ToggleProButton.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ToggleProButton({
  userId,
  currentRole,
}: {
  userId: string;
  currentRole: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (currentRole === "ADMIN") return null;

  const handleToggle = async () => {
    const action = currentRole === "PRO" ? "取消 Pro 资格" : "为该用户开通 Pro 会员";
    if (!confirm(`确定要${action}吗？`)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/toggle-pro`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        router.refresh();
      } else {
        alert(data.error || "操作失败");
      }
    } catch (err) {
      console.error(err);
      alert("网络请求异常");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`text-[11px] font-semibold px-2 py-0.5 rounded transition disabled:opacity-50 mt-1.5 ${
        currentRole === "PRO"
          ? "bg-gray-100 text-gray-500 hover:bg-rose-50 hover:text-rose-600"
          : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-600 hover:text-white"
      }`}
    >
      {loading ? "..." : currentRole === "PRO" ? "降为免费" : "⚡ 开通 Pro"}
    </button>
  );
}
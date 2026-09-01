// components/admin/SyncJobsButton.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { syncJobsAction } from "@/app/admin/(protected)/jobs/actions";

export default function SyncJobsButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSync = async () => {
    if (!confirm("确定要立即从 Amazon、OpenAI、Stripe、Figma 等官方接口抓取最新大厂在招岗位吗？")) return;

    setLoading(true);
    try {
      // 🌟 直接调用 Server Action，无需走 HTTP API，0 报错风险
      const res = await syncJobsAction();
      alert(`同步完成！成功新增 ${res.count} 个在招大厂岗位。`);
      router.refresh();
    } catch (err: any) {
      alert(err.message || "网络请求异常，请检查数据库连接");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSync}
      disabled={loading}
      className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs sm:text-sm font-semibold rounded-xl transition shadow-sm active:scale-95 disabled:opacity-50 whitespace-nowrap"
    >
      <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-emerald-600" : ""}`} />
      <span>{loading ? "正在抓取最新大厂岗位..." : "🔄 抓取同步大厂岗位"}</span>
    </button>
  );
}
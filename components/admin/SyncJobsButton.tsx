// components/admin/SyncJobsButton.tsx

"use client";

import { useState } from "react";
import { syncJobsAction } from "@/app/admin/(protected)/jobs/actions";

export default function SyncJobsButton() {
  const [loading, setLoading] = useState(false);

  const handleSync = async () => {
    if (loading) return;

    const confirmed = confirm(
      "确定要立即同步所有公司的官方招聘数据吗？\n\n" +
        "同步过程可能需要一些时间，请不要重复点击。"
    );

    if (!confirmed) return;

    setLoading(true);

    try {
      const res = await syncJobsAction();

      if (!res || !res.success) {
        throw new Error("岗位同步失败");
      }

      alert(
        [
          "同步完成！",
          "",
          `公司：${res.totalCompanies}`,
          `成功：${res.succeededCompanies}`,
          `失败：${res.failedCompanies}`,
          "",
          `抓取：${res.totalFetched}`,
          `新增：${res.totalNew}`,
          `更新：${res.totalUpdated}`,
          `未变化：${res.totalUnchanged}`,
          `关闭：${res.totalClosed}`,
        ].join("\n")
      );

      window.location.reload();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "同步失败，请稍后重试";

      alert(`同步失败：${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleSync}
      disabled={loading}
      className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <>
          <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          正在同步...
        </>
      ) : (
        <>🔄 抓取同步大厂岗位</>
      )}
    </button>
  );
}
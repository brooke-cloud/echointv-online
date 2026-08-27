// app/admin/(protected)/posts/ImportPostsButton.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { importPresetPosts } from "./actions";

export default function ImportPostsButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleImport = async () => {
    if (!confirm("确定要一键导入预设的精选大厂求职面经与系统设计攻略吗？")) return;

    setLoading(true);
    try {
      const res = await importPresetPosts();
      alert(`导入完成！已成功新增 ${res.count} 篇大厂深度面经。`);
      router.refresh();
    } catch (err: any) {
      alert(err.message || "导入失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleImport}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-xl bg-purple-50 px-4 py-2.5 text-sm font-semibold text-purple-700 border border-purple-200 shadow-sm transition hover:bg-purple-100 disabled:opacity-50"
    >
      <span>📥</span>
      <span>{loading ? "正在导入中..." : "一键导入预设面经"}</span>
    </button>
  );
}
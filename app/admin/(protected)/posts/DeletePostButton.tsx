// app/admin/(protected)/posts/DeletePostButton.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deletePost } from "./actions";

export default function DeletePostButton({ id }: { id: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("确定要删除这篇面经文章吗？此操作不可恢复。")) return;

    setLoading(true);
    try {
      await deletePost(id);
      router.refresh();
    } catch (err: any) {
      alert(err.message || "删除失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-xs text-red-500 hover:text-red-700 font-medium transition disabled:opacity-50 ml-3"
    >
      {loading ? "..." : "Delete"}
    </button>
  );
}
// components/admin/DeleteJobButton.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteJobAction } from "@/app/admin/(protected)/jobs/actions";

export default function DeleteJobButton({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`确定要删除岗位【${title}】吗？`)) {
      return;
    }

    setLoading(true);

    try {
      await deleteJobAction(id);
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "删除失败";

      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="text-xs text-red-500 hover:text-red-700 font-medium transition disabled:opacity-50"
    >
      {loading ? "删除中..." : "删除"}
    </button>
  );
}
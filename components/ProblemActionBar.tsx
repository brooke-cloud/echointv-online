"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Star, Loader2 } from "lucide-react";

type ProblemActionBarProps = {
  problemId: string;
  initialStatus: string | null;
  initialFavorite: boolean;
  isLoggedIn: boolean;
};

export default function ProblemActionBar({
  problemId,
  initialStatus,
  initialFavorite,
  isLoggedIn,
}: ProblemActionBarProps) {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(initialStatus);
  const [isFavorite, setIsFavorite] = useState<boolean>(initialFavorite);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [loadingFavorite, setLoadingFavorite] = useState(false);

  // 1. 切换做题打卡状态 (已掌握 / 未掌握)
  const toggleStatus = async () => {
    if (!isLoggedIn) {
      if (confirm("登录 EchoINTV 账户后可记录刷题进度，是否前往登录？")) {
        router.push("/login");
      }
      return;
    }

    const nextStatus = status === "SOLVED" ? "NONE" : "SOLVED";
    setStatus(nextStatus === "NONE" ? null : "SOLVED"); // 乐观更新
    setLoadingProgress(true);

    try {
      await fetch("/api/problem/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId, status: nextStatus }),
      });
      router.refresh();
    } catch (error) {
      console.error("更新打卡状态失败:", error);
      setStatus(initialStatus); // 失败回滚
    } finally {
      setLoadingProgress(false);
    }
  };

  // 2. 切换收藏状态
  const toggleFavorite = async () => {
    if (!isLoggedIn) {
      if (confirm("登录 EchoINTV 账户后可收藏题目，是否前往登录？")) {
        router.push("/login");
      }
      return;
    }

    const nextFavorite = !isFavorite;
    setIsFavorite(nextFavorite); // 乐观更新
    setLoadingFavorite(true);

    try {
      await fetch("/api/problem/favorite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId, isFavorite: nextFavorite }),
      });
      router.refresh();
    } catch (error) {
      console.error("更新收藏状态失败:", error);
      setIsFavorite(initialFavorite);
    } finally {
      setLoadingFavorite(false);
    }
  };

  const isSolved = status === "SOLVED";

  return (
    <div className="flex items-center gap-2.5">
      {/* 标记为已掌握按钮 */}
      <button
        onClick={toggleStatus}
        disabled={loadingProgress}
        className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs font-semibold shadow-sm transition ${
          isSolved
            ? "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            : "border-gray-200 bg-white text-gray-700 hover:border-emerald-300 hover:bg-emerald-50/40 hover:text-emerald-700"
        }`}
        title={isSolved ? "点击取消已掌握标记" : "点击标记为已掌握"}
      >
        {loadingProgress ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <CheckCircle2
            className={`h-4 w-4 ${
              isSolved ? "text-emerald-600" : "text-gray-400"
            }`}
          />
        )}
        <span>{isSolved ? "已掌握 (Solved)" : "标记已掌握"}</span>
      </button>

      {/* 收藏题目按钮 */}
      <button
        onClick={toggleFavorite}
        disabled={loadingFavorite}
        className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold shadow-sm transition ${
          isFavorite
            ? "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100"
            : "border-gray-200 bg-white text-gray-700 hover:border-amber-300 hover:bg-amber-50/40 hover:text-amber-700"
        }`}
        title={isFavorite ? "点击取消收藏" : "点击收藏此题"}
      >
        {loadingFavorite ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Star
            className={`h-3.5 w-3.5 ${
              isFavorite
                ? "text-amber-500 fill-amber-500"
                : "text-gray-400"
            }`}
          />
        )}
        <span>{isFavorite ? "已收藏" : "收藏"}</span>
      </button>
    </div>
  );
}
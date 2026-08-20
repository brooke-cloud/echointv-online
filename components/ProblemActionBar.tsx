"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  problemId: number;
  initialSolved: boolean;
  initialFavorited: boolean;
}

export default function ProblemActionBar({
  problemId,
  initialSolved,
  initialFavorited,
}: Props) {
  const router = useRouter();
  const [solved, setSolved] = useState(initialSolved);
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loadingSolved, setLoadingSolved] = useState(false);
  const [loadingFav, setLoadingFav] = useState(false);

  const toggleSolved = async () => {
    setLoadingSolved(true);
    try {
      const res = await fetch("/api/problem/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId }),
      });
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      setSolved(data.isSolved);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSolved(false);
    }
  };

  const toggleFavorite = async () => {
    setLoadingFav(true);
    try {
      const res = await fetch("/api/problem/favorite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId }),
      });
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      setFavorited(data.isFavorited);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingFav(false);
    }
  };

  return (
    <div className="flex items-center gap-3 py-4 border-y border-gray-100 my-6">
      <button
        onClick={toggleSolved}
        disabled={loadingSolved}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition ${
          solved
            ? "bg-green-600 text-white shadow hover:bg-green-700"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        <span>{solved ? "✓ 已掌握 (Solved)" : "○ 标记为已掌握"}</span>
      </button>

      <button
        onClick={toggleFavorite}
        disabled={loadingFav}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition ${
          favorited
            ? "bg-amber-50 text-amber-600 border border-amber-300"
            : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
        }`}
      >
        <span>{favorited ? "★ 已收藏" : "☆ 收藏题目"}</span>
      </button>
    </div>
  );
}
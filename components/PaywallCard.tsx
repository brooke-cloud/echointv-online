// components/PaywallCard.tsx

import Link from "next/link";
import { Lock, Sparkles, Check } from "lucide-react";

interface PaywallCardProps {
  isLoggedIn?: boolean;
}

export default function PaywallCard({ isLoggedIn = false }: PaywallCardProps) {
  return (
    <div className="relative mx-auto my-12 max-w-2xl overflow-hidden rounded-3xl border border-amber-200/90 bg-white/95 p-8 sm:p-10 text-center shadow-xl backdrop-blur">
      
      {/* 顶部锁头图标 */}
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-2xl shadow-inner border border-amber-100">
        🔒
      </div>

      {/* VIP 专享徽章 */}
      <div className="mt-5">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-700 border border-amber-200/80 shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-amber-600" />
          VIP 专享内容 · PREMIUM ONLY
        </span>
      </div>

      {/* 标题 */}
      <h3 className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 leading-snug">
        开通 Pro 会员，解锁完整深度题解与核心代码
      </h3>

      {/* 简介文案 */}
      <p className="mx-auto mt-3 max-w-lg text-sm text-gray-500 leading-relaxed">
        该内容为大厂高频面试真题/深度求职专栏。成为 Pro 会员即可无限畅读全站所有独家题解、系统设计拆解与算法最优解。
      </p>

      {/* 4 大核心特权清单 */}
      <div className="mx-auto mt-6 max-w-lg rounded-2xl border border-amber-100 bg-amber-50/40 p-5 text-left text-xs text-gray-700">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <span className="text-emerald-500 font-bold">✓</span>
            <span>全站顶尖大厂高频考题</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-500 font-bold">✓</span>
            <span>详细时空复杂度与最优代码</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-500 font-bold">✓</span>
            <span>系统设计与架构复盘专栏</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-500 font-bold">✓</span>
            <span>持续更新 2026 全球真题</span>
          </div>
        </div>
      </div>

      {/* 🌟 动态按钮区域：根据登录状态展示单一对应按钮 */}
      <div className="mt-8 flex justify-center">
        {isLoggedIn ? (
          /* 🟢 1. 已登录状态：展示【立即开通 Pro 会员】 */
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition-all hover:from-amber-600 hover:to-orange-600 hover:shadow-xl active:scale-95"
          >
            <span>👑</span>
            <span>立即开通 Pro 会员</span>
          </Link>
        ) : (
          /* ⚪ 2. 未登录状态：展示【已有会员？去登录】 */
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-300 bg-white px-8 py-3.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-gray-400 hover:bg-gray-50 active:scale-95"
          >
            <span>已有会员？去登录</span>
          </Link>
        )}
      </div>

    </div>
  );
}
// components/PaywallCard.tsx

import Link from "next/link";

interface PaywallCardProps {
  isLoggedIn?: boolean;
}

export default function PaywallCard({ isLoggedIn = false }: PaywallCardProps) {
  return (
    <div className="relative my-8 overflow-hidden rounded-2xl border border-amber-200/80 bg-gradient-to-b from-amber-50/50 to-white p-8 text-center shadow-md">
      {/* 背景装饰光晕 */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-lg mx-auto space-y-4">
        {/* 锁图标徽章 */}
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 text-2xl shadow-inner">
          🔒
        </div>

        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2">
            VIP 专享内容 · Premium Only
          </span>
          <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
            开通 Pro 会员，解锁完整深度题解与核心代码
          </h3>
          <p className="text-sm text-gray-600 mt-2 leading-relaxed">
            该内容为大厂高频面试真题/深度求职专栏。成为 Pro 会员即可无限畅读全站所有独家题解、系统设计拆解与算法最优解。
          </p>
        </div>

        {/* 权益亮点 */}
        <div className="grid grid-cols-2 gap-2 text-left text-xs text-gray-600 bg-white/80 backdrop-blur-xs p-4 rounded-xl border border-amber-100">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="text-emerald-500 font-bold">✓</span> 全站顶尖大厂高频考题
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <span className="text-emerald-500 font-bold">✓</span> 详细时空复杂度与最优代码
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <span className="text-emerald-500 font-bold">✓</span> 系统设计与架构复盘专栏
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <span className="text-emerald-500 font-bold">✓</span> 持续更新 2026 全球真题
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/pricing"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5"
          >
            👑 立即开通 Pro 会员
          </Link>

          {!isLoggedIn && (
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm border border-gray-200 shadow-xs transition"
            >
              已有会员？去登录
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
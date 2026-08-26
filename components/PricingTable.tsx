// components/PricingTable.tsx
"use client";

import Link from "next/link";

export default function PricingTable() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Free 免费版（完全不变） */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Free 免费版</h3>
            <p className="text-sm text-gray-500 mt-2 min-h-[40px] leading-relaxed">
              适合刚开始了解平台、体验题库与面经质量的求职者。
            </p>
            <div className="my-6">
              <span className="text-4xl sm:text-5xl font-extrabold text-gray-900">$0</span>
              <span className="text-sm text-gray-500 ml-2">/ 永久免费</span>
            </div>
            <div className="space-y-3.5 pt-6 border-t border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">权益包含</p>
              <div className="space-y-2.5 text-sm text-gray-700">
                <div className="flex items-center gap-2"><span className="text-blue-600 font-bold">✓</span> 可免费查看前 6 道大厂面试真题</div>
                <div className="flex items-center gap-2"><span className="text-blue-600 font-bold">✓</span> 可免费查看前 6 篇深度求职面经</div>
                <div className="flex items-center gap-2"><span className="text-blue-600 font-bold">✓</span> 基础代码高亮与题目要求</div>
                <div className="flex items-center gap-2"><span className="text-blue-600 font-bold">✓</span> 随时随地在线阅读体验</div>
              </div>
            </div>
          </div>
          <Link
            href="/register"
            className="mt-10 w-full py-3.5 px-4 text-center rounded-xl font-semibold text-sm transition bg-gray-50 hover:bg-gray-100 text-gray-900 border border-gray-200 block"
          >
            免费开始体验 →
          </Link>
        </div>

        {/* Pro 会员版 */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-blue-600 shadow-xl ring-2 ring-blue-600 flex flex-col justify-between relative">
          <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow">
            🔥 最受求职者推荐
          </span>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Pro 会员版</h3>
            <p className="text-sm text-gray-500 mt-2 min-h-[40px] leading-relaxed">
              专为全力冲刺秋招、春招与社招大厂面试的工程师打造，全面扫清考点盲区。
            </p>
            <div className="my-6">
              <span className="text-4xl sm:text-5xl font-extrabold text-gray-900">$9.99</span>
              <span className="text-sm text-gray-500 ml-2">/ 月</span>
            </div>
            <div className="space-y-3.5 pt-6 border-t border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">权益包含</p>
              <div className="space-y-2.5 text-sm text-gray-700">
                <div className="flex items-center gap-2"><span className="text-blue-600 font-bold">✓</span> 🔓 解锁全站所有大厂面试真题（无限制畅刷）</div>
                <div className="flex items-center gap-2"><span className="text-blue-600 font-bold">✓</span> 🔓 解锁全站所有大厂求职面经与技术专栏</div>
                <div className="flex items-center gap-2"><span className="text-blue-600 font-bold">✓</span> 独家最优解题思路、代码实现与复杂度分析</div>
                <div className="flex items-center gap-2"><span className="text-blue-600 font-bold">✓</span> 高频考点分类（算法、系统设计、真题还原）</div>
                <div className="flex items-center gap-2"><span className="text-blue-600 font-bold">✓</span> 每周持续同步更新大厂最新面试原题</div>
              </div>
            </div>
          </div>

          {/* ✅ 改用 Link 跳转到 /checkout */}
          <Link
            href="/checkout"
            className="mt-10 w-full py-3.5 px-4 text-center rounded-xl font-bold text-sm transition bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md flex items-center justify-center gap-2"
          >
            <span>💳 立即开通 Pro（$9.99/月） →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
"use client";

import Link from "next/link";

export default function PricingTable() {
  const tiers = [
    {
      name: "Free 免费版",
      id: "free",
      price: "$0",
      period: "永久免费",
      description: "适合刚开始了解平台、体验题库与面经质量的求职者。",
      features: [
        "可免费查看前 5 道大厂面试真题",
        "可免费查看前 5 篇深度求职面经",
        "基础代码高亮与题目要求",
        "随时随地在线阅读体验",
      ],
      ctaText: "免费开始体验",
      href: "/register",
      popular: false,
      isExternal: false,
    },
    {
      name: "Pro 会员版",
      id: "pro",
      price: "$9.9",
      period: "每月",
      description: "专为全力冲刺秋招、春招与社招大厂面试的工程师打造，全面扫清考点盲区。",
      features: [
        "🔓 解锁全站所有大厂面试真题（无限制畅刷）",
        "🔓 解锁全站所有大厂求职面经与技术专栏",
        "独家最优解题思路、代码实现与复杂度分析",
        "高频考点分类（算法、系统设计、大厂真题还原）",
        "每周持续同步更新大厂最新面试原题",
      ],
      ctaText: "立即订阅 Pro 会员",
      href: "/api/checkout", // 修复为实际的 API 接口
      popular: true,
      isExternal: true,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {tiers.map((tier) => (
          <div
            key={tier.id}
            className={`bg-white rounded-3xl p-8 sm:p-10 border flex flex-col justify-between relative transition duration-300 ${
              tier.popular
                ? "border-blue-600 shadow-xl ring-2 ring-blue-600"
                : "border-gray-200 hover:border-gray-300 shadow-sm"
            }`}
          >
            {tier.popular && (
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow">
                🔥 最受求职者推荐
              </span>
            )}

            <div>
              <h3 className="text-2xl font-bold text-gray-900">{tier.name}</h3>
              <p className="text-sm text-gray-500 mt-2 min-h-[40px] leading-relaxed">{tier.description}</p>

              <div className="my-6">
                <span className="text-4xl sm:text-5xl font-extrabold text-gray-900">{tier.price}</span>
                <span className="text-sm text-gray-500 ml-2">/ {tier.period}</span>
              </div>

              <div className="space-y-3.5 pt-6 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">权益包含</p>
                {tier.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-sm text-gray-700">
                    <span className="text-blue-600 font-bold mt-0.5">✓</span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {tier.isExternal ? (
              <a
                href={tier.href}
                className="mt-10 w-full py-3.5 px-4 text-center rounded-xl font-semibold text-sm transition bg-blue-600 hover:bg-blue-700 text-white shadow-md block"
              >
                {tier.ctaText} →
              </a>
            ) : (
              <Link
                href={tier.href}
                className="mt-10 w-full py-3.5 px-4 text-center rounded-xl font-semibold text-sm transition bg-gray-50 hover:bg-gray-100 text-gray-900 border border-gray-200 block"
              >
                {tier.ctaText} →
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
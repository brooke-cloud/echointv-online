"use client";

import { useState } from "react";

const faqs = [
  {
    q: "Free 免费版和 Pro 会员版有什么区别？",
    a: "Free 免费版可以永久免费查看前 5 道真题与前 5 篇面经；升级 Pro 会员后将立即解锁全站所有题目、系统设计专栏与深度面经，并可查看最优解题思路和代码实现。",
  },
  {
    q: "开通 Pro 会员后，题库会持续更新吗？",
    a: "会。我们每周都会持续收录并更新北美与国内顶尖大厂（Meta、Google、Amazon、字节等）的最新面试原题与复盘解析，会员无需额外付费即可享受新内容。",
  },
  {
    q: "如何取消订阅？",
    a: "按月订阅的会员支持随时在个人中心一键取消续费，取消后在当前计费周期结束前依然享有完整会员权益。",
  },
  {
    q: "支付支持哪些方式？",
    a: "支持主流信用卡（Visa、MasterCard、American Express）、Apple Pay、Google Pay 等多种安全支付方式。",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {faqs.map((faq, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div key={idx} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <button
              onClick={() => setOpenIndex(isOpen ? null : idx)}
              className="w-full p-5 text-left flex items-center justify-between font-semibold text-gray-900 hover:text-blue-600 transition"
            >
              <span>{faq.q}</span>
              <span className="text-lg text-gray-400">{isOpen ? "−" : "+"}</span>
            </button>
            {isOpen && (
              <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-3">
                {faq.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
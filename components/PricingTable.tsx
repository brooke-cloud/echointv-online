// components/PricingTable.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function PricingTable() {
  const [showPayModal, setShowPayModal] = useState(false);
  const [payMethod, setPayMethod] = useState<"wechat" | "alipay">("wechat");

  return (
    <>
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Free 免费版 */}
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
                  <div className="flex items-center gap-2"><span className="text-blue-600 font-bold">✓</span> 可免费查看前 5 道大厂面试真题</div>
                  <div className="flex items-center gap-2"><span className="text-blue-600 font-bold">✓</span> 可免费查看前 5 篇深度求职面经</div>
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
                <span className="text-4xl sm:text-5xl font-extrabold text-gray-900">¥69</span>
                <span className="text-sm text-gray-500 ml-2">/ 每月 (约 $9.9)</span>
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

            {/* 🌟 一键扫码支付按钮 */}
            <button
              onClick={() => setShowPayModal(true)}
              className="mt-10 w-full py-3.5 px-4 text-center rounded-xl font-bold text-sm transition bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md flex items-center justify-center gap-2"
            >
              <span>💬 微信 / 🟦 支付宝 扫码开通 Pro（¥69） →</span>
            </button>
          </div>
        </div>
      </div>

      {/* 🌟 微信 / 支付宝 扫码开通弹窗 */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowPayModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 w-8 h-8 rounded-full flex items-center justify-center text-lg"
            >
              ✕
            </button>

            <div>
              <h3 className="text-lg font-bold text-gray-900">扫码开通 Pro 会员</h3>
              <p className="text-xs text-gray-500 mt-1">
                费用：<span className="font-bold text-emerald-600 text-base">¥69 / 月</span>
              </p>
            </div>

            {/* 微信 / 支付宝 切换选项卡 */}
            <div className="flex rounded-xl bg-gray-100 p-1 text-xs font-semibold">
              <button
                onClick={() => setPayMethod("wechat")}
                className={`flex-1 py-1.5 rounded-lg transition ${
                  payMethod === "wechat"
                    ? "bg-white text-emerald-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                💬 微信支付
              </button>
              <button
                onClick={() => setPayMethod("alipay")}
                className={`flex-1 py-1.5 rounded-lg transition ${
                  payMethod === "alipay"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                🟦 支付宝
              </button>
            </div>

            {/* 二维码展示区域 */}
            <div className="p-3 bg-gray-50 rounded-2xl inline-block border border-gray-100">
              <Image
                src="/wechat-qrcode.png"
                alt="收款二维码"
                width={180}
                height={180}
                className="rounded-xl mx-auto shadow-sm"
              />
              <p className="text-xs text-gray-600 font-mono mt-2">
                {payMethod === "wechat" ? "微信客服：lububu611" : "支付宝账号：lububu611"}
              </p>
            </div>

            {/* 步骤说明 */}
            <div className="bg-blue-50/60 p-3.5 rounded-xl text-left text-xs text-gray-600 space-y-1.5 border border-blue-100/60 leading-relaxed">
              <div className="font-semibold text-blue-900">开通流程：</div>
              <div>1. 手机扫码转账 ¥69，<strong>转账请务必备注您的注册邮箱</strong>。</div>
              <div>2. 添加微信好友发送转账截图，管理员收到后 1 分钟内为您点亮 Pro 会员！</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
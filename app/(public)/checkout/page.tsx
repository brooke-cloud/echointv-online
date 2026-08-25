// app/(public)/checkout/page.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Script from "next/script";

declare global {
  interface Window {
    Paddle?: any;
  }
}

export default function CheckoutPage() {
  const [selectedMethod, setSelectedMethod] = useState<"paddle" | "wechat" | "alipay">("paddle");
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [paddleReady, setPaddleReady] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setUser(data.user));
  }, []);

  // 初始化 Paddle.js
  const handlePaddleInit = () => {
  if (typeof window !== "undefined" && window.Paddle) {
    const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || "";
    
    // 🌟 根据 token 自动精准匹配环境（以 test_ 开头自动设为 sandbox）
    const env = token.startsWith("test_") ? "sandbox" : "production";

    window.Paddle.Environment.set(env);
    window.Paddle.Initialize({
      token,
      eventCallback: function (data: any) {
        console.log("Paddle Event:", data);
      },
    });
    setPaddleReady(true);
  }
};

const openPaddleCheckout = () => {
  const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
  const priceId = process.env.NEXT_PUBLIC_PADDLE_PRICE_ID;

  if (!token || !priceId) {
    alert("Paddle 配置缺失，请检查环境变量 NEXT_PUBLIC_PADDLE_CLIENT_TOKEN 和 NEXT_PUBLIC_PADDLE_PRICE_ID");
    return;
  }

  if (!window.Paddle || !user) return;

  window.Paddle.Checkout.open({
    items: [
      {
        priceId: priceId,
        quantity: 1,
      },
    ],
    customer: {
      email: user.email,
    },
    customData: {
      userId: user.id,
    },
    settings: {
      successUrl: `${window.location.origin}/checkout/success`,
    },
  });
};
  const afdianBaseUrl = process.env.NEXT_PUBLIC_AFDIAN_URL || "https://afdian.com";
  const afdianCheckoutUrl = `${afdianBaseUrl}?remark=${encodeURIComponent(user?.email || "")}&custom_order_id=${user?.id || ""}`;

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
      {/* 异步加载 Paddle 官方 SDK */}
      <Script
        src="https://cdn.paddle.com/paddle/v2/paddle.js"
        onLoad={handlePaddleInit}
      />

      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <Link href="/pricing" className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1 mb-2">
            ← 返回方案列表
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900">收银台与支付通道</h1>
          <p className="text-sm text-gray-500 mt-1">选择最适合您的支付方式，付款后全自动秒开 Pro 会员</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* 左侧：订单摘要 */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6 self-start">
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4">
              订单摘要 (Order Summary)
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-gray-900">EchoINTV Pro 会员</div>
                  <div className="text-xs text-gray-500 mt-0.5">月度全功能订阅</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-extrabold text-gray-900">$9.90</div>
                  <div className="text-xs text-gray-400">约 ¥69.00</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100/60 space-y-2 text-xs text-gray-600 leading-relaxed">
                <div className="font-semibold text-blue-900">包含特权：</div>
                <div>✓ 500+ 大厂真题无限制畅刷</div>
                <div>✓ 全站深度求职面经与系统设计专栏</div>
                <div>✓ 独家最优题解代码与复杂度分析</div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 flex justify-between items-center text-sm">
              <span className="font-medium text-gray-500">实付总额：</span>
              <span className="text-2xl font-extrabold text-blue-600">$9.90 / ¥69</span>
            </div>
          </div>

          {/* 右侧：支付方式选择 */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-gray-900">选择支付方式</h2>

            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setSelectedMethod("paddle")}
                className={`p-3 rounded-2xl border text-center transition ${
                  selectedMethod === "paddle"
                    ? "border-blue-600 bg-blue-50/40 text-blue-700 font-bold ring-1 ring-blue-600"
                    : "border-gray-200 hover:border-gray-300 text-gray-700"
                }`}
              >
                <div className="text-xl mb-1">💳</div>
                <div className="text-xs">信用卡 / Apple Pay</div>
              </button>

              <button
                onClick={() => setSelectedMethod("wechat")}
                className={`p-3 rounded-2xl border text-center transition ${
                  selectedMethod === "wechat"
                    ? "border-emerald-600 bg-emerald-50/40 text-emerald-700 font-bold ring-1 ring-emerald-600"
                    : "border-gray-200 hover:border-gray-300 text-gray-700"
                }`}
              >
                <div className="text-xl mb-1">💬</div>
                <div className="text-xs">微信支付</div>
              </button>

              <button
                onClick={() => setSelectedMethod("alipay")}
                className={`p-3 rounded-2xl border text-center transition ${
                  selectedMethod === "alipay"
                    ? "border-sky-600 bg-sky-50/40 text-sky-700 font-bold ring-1 ring-sky-600"
                    : "border-gray-200 hover:border-gray-300 text-gray-700"
                }`}
              >
                <div className="text-xl mb-1">🟦</div>
                <div className="text-xs">支付宝</div>
              </button>
            </div>

            <div className="pt-2">
              {/* 🌟 1. Paddle 国际信用卡 / Apple Pay 收银台 */}
              {selectedMethod === "paddle" ? (
                <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200 text-center space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-bold text-gray-900">Paddle 国际安全收银台</h3>
                    <p className="text-xs text-gray-500">支持 Visa、MasterCard、Apple Pay、Google Pay 与 PayPal</p>
                  </div>

                  <button
                    onClick={openPaddleCheckout}
                    disabled={!paddleReady}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50 text-sm"
                  >
                    {!paddleReady ? "正在加载收银台..." : "立即结账 ($9.90 USD) →"}
                  </button>
                </div>
              ) : (
                /* 2. 微信 / 支付宝 自动收银台 */
                <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200 text-center space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-bold text-gray-900">
                      {selectedMethod === "wechat" ? "💬 微信扫码支付 (¥69.00)" : "🟦 支付宝扫码支付 (¥69.00)"}
                    </h3>
                    <p className="text-xs text-emerald-600 font-semibold">⚡ 支持扫码自动识别，付款后 1 秒全自动开通</p>
                  </div>

                  <div className="py-2">
                    <a
                      href={afdianCheckoutUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-md transition text-sm text-center"
                    >
                      前往收银台扫码付款 (¥69) →
                    </a>
                  </div>

                  <p className="text-[11px] text-gray-400">
                    当前账号：<span className="font-mono text-gray-600">{user?.email}</span>（付款后系统将自动为此账号开通 Pro 权限）
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
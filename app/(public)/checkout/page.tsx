// app/(public)/checkout/page.tsx
"use client";
import CheckoutClient from "@/components/checkout/CheckoutClient";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, Loader2, ShieldCheck } from "lucide-react";
import { fetchJson, HttpError } from "@/lib/fetch-json";

function LegacyCheckoutPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  // PayPal 支付处理（使用新价格 $6.90）
  const handlePayPalPayment = async () => {
    if (isProcessing) return;
    setError("");
    setIsProcessing(true);

    try {
      const { approveUrl } = await fetchJson<{ approveUrl: string }>("/api/checkout", {
        method: "POST",
      });
      window.location.assign(approveUrl);
    } catch (paymentError) {
      if (paymentError instanceof HttpError && paymentError.status === 401) {
        window.location.assign("/login?redirect=/checkout");
        return;
      }
      setError(paymentError instanceof Error ? paymentError.message : "暂时无法连接 PayPal，请稍后重试");
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <Link href="/pricing" className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1 mb-2">
            ← 返回方案列表
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900">收银台与支付通道</h1>
          <p className="text-sm text-gray-900 mt-1">选择最适合您的支付方式，付款后全自动秒开 Pro 会员</p>
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
                  {/* ✅ 价格改为 $6.90，人民币参考价可调整（约¥46） */}
                  <div className="text-xl font-extrabold text-gray-900">$6.90</div>
                  <div className="text-xs text-gray-400">约 ¥46.00</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100/60 space-y-2 text-xs text-gray-600 leading-relaxed">
                <div className="font-semibold text-blue-900">包含特权：</div>
                <div>✓ 100+ 大厂真题无限制畅刷</div>
                <div>✓ 全站深度求职面经与系统设计专栏</div>
                <div>✓ 独家最优题解代码与复杂度分析</div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 flex justify-between items-center text-sm">
              <span className="font-medium text-gray-500">实付总额：</span>
              {/* ✅ 价格改为 $6.90 / ¥50 */}
              <span className="text-2xl font-extrabold text-blue-600">$6.90 / ¥46</span>
            </div>
          </div>

          {/* 右侧：唯一支付方式 */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl">💳</div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">PayPal 安全支付</h2>
                <p className="text-xs text-gray-500">支持 PayPal 余额、信用卡和借记卡</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200 text-center space-y-4">
              <ShieldCheck className="mx-auto h-8 w-8 text-emerald-600" />
              <p className="text-sm text-gray-600">付款将在 PayPal 官方页面完成，本站不会接触或保存您的银行卡信息。</p>

              {error && (
                <div aria-live="polite" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-left text-sm text-rose-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handlePayPalPayment}
                disabled={isProcessing}
                className="flex w-full items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition disabled:cursor-not-allowed disabled:opacity-60 text-sm"
              >
                {isProcessing ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> 正在连接 PayPal...</>
                ) : (
                  "使用 PayPal 支付 $6.90 USD →"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutClient;

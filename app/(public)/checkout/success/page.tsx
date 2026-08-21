// app/(public)/checkout/success/page.tsx

import Link from "next/link";
import { capturePayPalOrder } from "@/lib/paypal";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token: orderId } = await searchParams;
  const currentUser = await getCurrentUser();

  if (orderId) {
    try {
      const captureData = await capturePayPalOrder(orderId);
      if (captureData.status === "COMPLETED") {
        const userId =
          captureData.purchase_units?.[0]?.payments?.captures?.[0]?.custom_id ||
          captureData.purchase_units?.[0]?.custom_id ||
          currentUser?.id;

        if (userId) {
          await prisma.user.update({
            where: { id: userId },
            data: { role: "PRO" },
          });
        }
      }
    } catch (err) {
      console.error("PayPal 验证异常:", err);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-gray-100 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 bg-green-100 text-green-600 text-3xl rounded-full flex items-center justify-center mx-auto shadow-sm">
          ✓
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">支付成功，欢迎加入 Pro 会员！</h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            您的账户已成功开通 <span className="text-blue-600 font-bold">EchoINTV Pro 会员</span>，全站所有大厂面试真题与深度求职面经已全部解锁！
          </p>
        </div>

        <div className="pt-4 space-y-3">
          <Link
            href="/problem"
            className="block w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition"
          >
            立即前往题库畅刷 →
          </Link>
          <Link
            href="/profile"
            className="block w-full py-3 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-xl border border-gray-200 transition text-sm"
          >
            查看个人中心
          </Link>
        </div>
      </div>
    </div>
  );
}
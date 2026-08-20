import Link from "next/link";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  const currentUser = await getCurrentUser();

  // 🌟 实时开通逻辑：用户支付成功跳回时，校验 Stripe 订单并立即更新为 PRO 会员
  if (session_id) {
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      const userId =
        session.client_reference_id ||
        session.metadata?.userId ||
        currentUser?.id;

      if (session.payment_status === "paid" && userId) {
        await prisma.user.update({
          where: { id: userId },
          data: { role: "PRO" },
        });
      }
    } catch (err) {
      console.error("支付验证与即时开通会员失败:", err);
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
            您的账户已成功升级为 <span className="text-blue-600 font-bold">EchoINTV Pro 会员</span>，全站所有大厂面试真题与深度求职面经已全部解锁！
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
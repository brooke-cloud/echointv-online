import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/user-auth";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    // 未登录则重定向到登录页
    if (!user) {
      return NextResponse.redirect(`${siteUrl}/login?redirect=/pricing`);
    }

    // 创建 Stripe 结账会话 ($9.9 / 月)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "EchoINTV Pro 会员（月度订阅）",
              description: "解锁全库所有大厂面试真题与深度面经",
            },
            unit_amount: 990, // $9.90 (单位为分)
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      customer_email: user.email,
      client_reference_id: user.id,
      metadata: {
        userId: user.id,
      },
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/pricing`,
    });

    if (!session.url) {
      throw new Error("未能生成 Stripe 会话链接");
    }

    return NextResponse.redirect(session.url);
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: error.message || "创建支付会话失败" }, { status: 500 });
  }
}
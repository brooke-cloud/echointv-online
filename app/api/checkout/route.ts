// app/api/checkout/route.ts

import { NextResponse } from "next/server";
import { createPayPalOrder } from "@/lib/paypal";
import { getCurrentUser } from "@/lib/user-auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    // 未登录则先引导至登录页
    if (!user) {
      return NextResponse.redirect(`${siteUrl}/login?redirect=/pricing`);
    }

    // 调用 PayPal 生成收银台链接
    const approveUrl = await createPayPalOrder(user.id);

    // 重定向至 PayPal 官方支付页面
    return NextResponse.redirect(approveUrl);
  } catch (error: any) {
    console.error("PayPal Checkout Error:", error);
    return NextResponse.json(
      { error: error.message || "创建支付失败" },
      { status: 500 }
    );
  }
}
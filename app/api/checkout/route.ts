// app/api/checkout/route.ts

import { NextResponse } from "next/server";
import { createPayPalOrder } from "@/lib/paypal";
import { getCurrentUser } from "@/lib/user-auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    if (!user) {
      return NextResponse.redirect(`${siteUrl}/login?redirect=/pricing`);
    }

    const approveUrl = await createPayPalOrder(user.id);
    return NextResponse.redirect(approveUrl);
  } catch (error: any) {
    console.error("PayPal Checkout Error:", error);
    return NextResponse.json(
      { error: error.message || "创建支付失败" },
      { status: 500 }
    );
  }
}
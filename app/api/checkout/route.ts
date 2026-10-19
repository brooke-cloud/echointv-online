// app/api/checkout/route.ts

import { NextResponse } from "next/server";
import { createPayPalOrder } from "@/lib/paypal";
import { getCurrentUser } from "@/lib/user-auth";

async function legacyPOST() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "请先登录后再继续支付" }, { status: 401 });
    }

    const approveUrl = await createPayPalOrder(user.id);
    return NextResponse.json({ approveUrl });
  } catch {
    return NextResponse.json(
      { error: "PayPal 暂时不可用，请稍后重试" },
      { status: 503, headers: { "Retry-After": "2" } }
    );
  }
}

export async function POST() {
  return NextResponse.json({ error: "This endpoint has moved to /api/billing/checkout." }, { status: 410 });
}

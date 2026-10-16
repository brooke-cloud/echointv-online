// app/api/checkout/route.ts

import { NextResponse } from "next/server";
import { createPayPalOrder } from "@/lib/paypal";
import { getCurrentUser } from "@/lib/user-auth";

export async function POST() {
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

import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/user-auth";
import { prisma } from "@/lib/prisma";
import { createPayPalSubscription } from "@/lib/billing/paypal";
import { getPaddlePriceId, PRO_MONTHLY_PLAN } from "@/lib/billing/plans";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in before checkout." }, { status: 401 });
  try {
    const { provider } = await request.json() as { provider?: string };
    if (provider === "paddle") {
      const clientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
      if (!clientToken) throw new Error("Paddle client token is not configured.");
      return NextResponse.json({ provider, clientToken, environment: process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === "production" ? "production" : "sandbox", priceId: getPaddlePriceId(), customerEmail: user.email, customData: { userId: user.id, planCode: PRO_MONTHLY_PLAN.code, checkoutReference: randomUUID() }, plan: PRO_MONTHLY_PLAN });
    }
    if (provider === "paypal") {
      const checkout = await createPayPalSubscription(user.id);
      await prisma.billingSubscription.upsert({ where: { provider_providerSubscriptionId: { provider: "PAYPAL", providerSubscriptionId: checkout.subscriptionId } }, create: { userId: user.id, provider: "PAYPAL", providerSubscriptionId: checkout.subscriptionId, planCode: PRO_MONTHLY_PLAN.code, status: "APPROVAL_PENDING" }, update: { userId: user.id, status: "APPROVAL_PENDING" } });
      return NextResponse.json({ provider, ...checkout });
    }
    return NextResponse.json({ error: "Unsupported payment provider." }, { status: 400 });
  } catch (error) {
    console.error("Billing checkout error", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Checkout is temporarily unavailable." }, { status: 503 });
  }
}

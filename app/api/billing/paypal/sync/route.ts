import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/user-auth";
import { syncPayPalSubscriptionRecord } from "@/lib/billing/paypal-subscriptions";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });

  try {
    const { subscriptionId } = await request.json() as { subscriptionId?: string };
    if (!subscriptionId) {
      return NextResponse.json({ error: "PayPal subscription ID is required." }, { status: 400 });
    }
    const subscription = await syncPayPalSubscriptionRecord(subscriptionId, user.id);
    return NextResponse.json({ status: subscription.status, currentPeriodEnd: subscription.currentPeriodEnd });
  } catch (error) {
    console.error("PayPal subscription sync failed", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to confirm the subscription." }, { status: 502 });
  }
}

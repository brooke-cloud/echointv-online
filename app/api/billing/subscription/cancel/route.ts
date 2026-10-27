import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/user-auth";
import { prisma } from "@/lib/prisma";
import { cancelPayPalSubscription, getPayPalSubscription } from "@/lib/billing/paypal";
import { syncUserProRole } from "@/lib/billing/entitlements";

const asDate = (value?: string | null) => value ? new Date(value) : null;

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });

  const subscription = await prisma.billingSubscription.findFirst({
    where: { userId: user.id, provider: "PAYPAL", status: { in: ["ACTIVE", "APPROVAL_PENDING", "SUSPENDED", "PAST_DUE"] } },
    orderBy: { updatedAt: "desc" },
  });
  if (!subscription) return NextResponse.json({ error: "No active PayPal subscription was found." }, { status: 404 });

  if (subscription.status === "APPROVAL_PENDING") {
    await prisma.billingSubscription.delete({ where: { id: subscription.id } });
    await syncUserProRole(user.id);
    return NextResponse.json({ cancelled: true, discarded: true, currentPeriodEnd: null });
  }

  try {
    const remote = await getPayPalSubscription(subscription.providerSubscriptionId);
    if (remote.custom_id && remote.custom_id !== user.id) {
      return NextResponse.json({ error: "Subscription ownership could not be verified." }, { status: 403 });
    }
    const periodEnd = asDate(remote.billing_info?.next_billing_time) || subscription.currentPeriodEnd;
    if (!["CANCELLED", "CANCELED"].includes(String(remote.status || "").toUpperCase())) {
      await cancelPayPalSubscription(subscription.providerSubscriptionId);
    }
    const updated = await prisma.billingSubscription.update({
      where: { id: subscription.id },
      data: { status: "CANCELLED", cancelAtPeriodEnd: true, canceledAt: new Date(), currentPeriodEnd: periodEnd, metadata: remote },
    });
    await syncUserProRole(user.id);
    return NextResponse.json({ cancelled: true, currentPeriodEnd: updated.currentPeriodEnd });
  } catch (error) {
    console.error("PayPal subscription cancellation failed", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to cancel the subscription." }, { status: 502 });
  }
}

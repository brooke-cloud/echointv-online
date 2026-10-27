import "server-only";
import { prisma } from "@/lib/prisma";
import { getPayPalSubscription } from "./paypal";
import { PRO_MONTHLY_PLAN } from "./plans";
import { syncUserProRole } from "./entitlements";

const asDate = (value?: string | null) => value ? new Date(value) : null;

export async function syncPayPalSubscriptionRecord(
  subscriptionId: string,
  expectedUserId?: string,
) {
  const remote = await getPayPalSubscription(subscriptionId);
  const existing = await prisma.billingSubscription.findUnique({
    where: {
      provider_providerSubscriptionId: {
        provider: "PAYPAL",
        providerSubscriptionId: subscriptionId,
      },
    },
  });
  const userId = remote.custom_id || existing?.userId;

  if (!userId || (expectedUserId && userId !== expectedUserId)) {
    throw new Error("This PayPal subscription does not belong to the signed-in user.");
  }

  const status = String(remote.status || existing?.status || "APPROVAL_PENDING").toUpperCase();
  const currentPeriodEnd = asDate(remote.billing_info?.next_billing_time) || existing?.currentPeriodEnd || null;
  const cancelled = status === "CANCELLED" || status === "CANCELED";

  const subscription = await prisma.billingSubscription.upsert({
    where: {
      provider_providerSubscriptionId: {
        provider: "PAYPAL",
        providerSubscriptionId: subscriptionId,
      },
    },
    create: {
      userId,
      provider: "PAYPAL",
      providerSubscriptionId: subscriptionId,
      providerCustomerId: remote.subscriber?.payer_id,
      planCode: PRO_MONTHLY_PLAN.code,
      status,
      currentPeriodStart: asDate(remote.start_time),
      currentPeriodEnd,
      cancelAtPeriodEnd: cancelled,
      canceledAt: cancelled ? new Date() : null,
      metadata: remote,
    },
    update: {
      providerCustomerId: remote.subscriber?.payer_id,
      status,
      currentPeriodStart: asDate(remote.start_time) || existing?.currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd: cancelled,
      canceledAt: cancelled ? existing?.canceledAt || new Date() : null,
      metadata: remote,
    },
  });

  await syncUserProRole(userId);
  return subscription;
}

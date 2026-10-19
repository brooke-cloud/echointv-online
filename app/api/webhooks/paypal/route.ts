import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPayPalWebhook } from "@/lib/billing/paypal";
import { PRO_MONTHLY_PLAN } from "@/lib/billing/plans";
import { beginWebhookEvent, finishWebhookEvent } from "@/lib/billing/webhook-events";
import { syncUserProRole } from "@/lib/billing/entitlements";
const asDate = (value?: string | null) => value ? new Date(value) : null;

export async function POST(request: Request) {
  const raw = await request.text(); let event: any;
  try { event = JSON.parse(raw); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  try { if (!(await verifyPayPalWebhook(request.headers, event))) return NextResponse.json({ error: "Invalid signature" }, { status: 401 }); }
  catch (error) { console.error("PayPal verification failed", error); return NextResponse.json({ error: "PayPal webhook is not configured." }, { status: 503 }); }
  const eventId = String(event.id || ""); const type = String(event.event_type || "");
  if (!eventId || !type) return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  if (!(await beginWebhookEvent("PAYPAL", eventId, type, raw))) return NextResponse.json({ received: true, duplicate: true });
  try {
    const resource = event.resource || {};
    if (type.startsWith("BILLING.SUBSCRIPTION.")) {
      const existing = await prisma.billingSubscription.findUnique({ where: { provider_providerSubscriptionId: { provider: "PAYPAL", providerSubscriptionId: resource.id } } });
      const userId = resource.custom_id || existing?.userId;
      if (userId && resource.id) {
        await prisma.billingSubscription.upsert({ where: { provider_providerSubscriptionId: { provider: "PAYPAL", providerSubscriptionId: resource.id } }, create: { userId, provider: "PAYPAL", providerSubscriptionId: resource.id, providerCustomerId: resource.subscriber?.payer_id, planCode: PRO_MONTHLY_PLAN.code, status: String(resource.status || type.split(".").at(-1)).toUpperCase(), currentPeriodStart: asDate(resource.start_time), currentPeriodEnd: asDate(resource.billing_info?.next_billing_time), canceledAt: type.endsWith("CANCELLED") ? new Date() : null, metadata: resource }, update: { status: String(resource.status || type.split(".").at(-1)).toUpperCase(), currentPeriodEnd: asDate(resource.billing_info?.next_billing_time), canceledAt: type.endsWith("CANCELLED") ? new Date() : undefined, metadata: resource } });
        await syncUserProRole(userId);
      }
    }
    if (type === "PAYMENT.SALE.COMPLETED") {
      const subscriptionId = resource.billing_agreement_id;
      const subscription = subscriptionId ? await prisma.billingSubscription.findUnique({ where: { provider_providerSubscriptionId: { provider: "PAYPAL", providerSubscriptionId: subscriptionId } } }) : null;
      if (subscription) await prisma.billingPayment.upsert({ where: { provider_providerOrderId: { provider: "PAYPAL", providerOrderId: resource.id } }, create: { userId: subscription.userId, provider: "PAYPAL", providerOrderId: resource.id, providerTransactionId: resource.id, planCode: PRO_MONTHLY_PLAN.code, amount: Math.round(Number(resource.amount?.total || "0") * 100), currency: resource.amount?.currency || "USD", status: "PAID", idempotencyKey: `paypal:${resource.id}:completed`, paidAt: asDate(resource.create_time) || new Date(), metadata: resource }, update: { status: "PAID", paidAt: asDate(resource.create_time) || new Date(), metadata: resource } });
    }
    await finishWebhookEvent("PAYPAL", eventId); return NextResponse.json({ received: true });
  } catch (error) { await finishWebhookEvent("PAYPAL", eventId, error); console.error("PayPal webhook failed", error); return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 }); }
}

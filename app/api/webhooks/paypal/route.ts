import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPayPalWebhook } from "@/lib/billing/paypal";
import { PRO_MONTHLY_PLAN } from "@/lib/billing/plans";
import { beginWebhookEvent, finishWebhookEvent } from "@/lib/billing/webhook-events";
import { syncUserProRole } from "@/lib/billing/entitlements";
import { syncPayPalSubscriptionRecord } from "@/lib/billing/paypal-subscriptions";
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
        const status = String(resource.status || type.split(".").at(-1)).toUpperCase();
        const cancelled = status === "CANCELLED" || status === "CANCELED";
        const periodEnd = asDate(resource.billing_info?.next_billing_time) || existing?.currentPeriodEnd || null;
        await prisma.billingSubscription.upsert({ where: { provider_providerSubscriptionId: { provider: "PAYPAL", providerSubscriptionId: resource.id } }, create: { userId, provider: "PAYPAL", providerSubscriptionId: resource.id, providerCustomerId: resource.subscriber?.payer_id, planCode: PRO_MONTHLY_PLAN.code, status, currentPeriodStart: asDate(resource.start_time), currentPeriodEnd: periodEnd, cancelAtPeriodEnd: cancelled, canceledAt: cancelled ? new Date() : null, metadata: resource }, update: { status, currentPeriodEnd: periodEnd, cancelAtPeriodEnd: cancelled, canceledAt: cancelled ? existing?.canceledAt || new Date() : null, metadata: resource } });
        await syncUserProRole(userId);
      }
    }
    if (type === "PAYMENT.SALE.COMPLETED") {
      const subscriptionId = resource.billing_agreement_id;
      const subscription = subscriptionId ? await prisma.billingSubscription.findUnique({ where: { provider_providerSubscriptionId: { provider: "PAYPAL", providerSubscriptionId: subscriptionId } } }) : null;
      if (subscription) {
        await prisma.billingPayment.upsert({ where: { provider_providerOrderId: { provider: "PAYPAL", providerOrderId: resource.id } }, create: { userId: subscription.userId, provider: "PAYPAL", providerOrderId: resource.id, providerTransactionId: resource.id, planCode: PRO_MONTHLY_PLAN.code, amount: Math.round(Number(resource.amount?.total || "0") * 100), currency: resource.amount?.currency || "USD", status: "PAID", idempotencyKey: `paypal:${resource.id}:completed`, paidAt: asDate(resource.create_time) || new Date(), metadata: resource }, update: { status: "PAID", paidAt: asDate(resource.create_time) || new Date(), metadata: resource } });
        await syncPayPalSubscriptionRecord(subscription.providerSubscriptionId, subscription.userId);
      }
    }
    if (type === "BILLING.SUBSCRIPTION.PAYMENT.FAILED") {
      const subscription = resource.id ? await prisma.billingSubscription.findUnique({ where: { provider_providerSubscriptionId: { provider: "PAYPAL", providerSubscriptionId: resource.id } } }) : null;
      if (subscription) {
        const graceEnd = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
        await prisma.billingSubscription.update({ where: { id: subscription.id }, data: { status: "PAST_DUE", currentPeriodEnd: subscription.currentPeriodEnd && subscription.currentPeriodEnd > graceEnd ? subscription.currentPeriodEnd : graceEnd, metadata: resource } });
        await syncUserProRole(subscription.userId);
      }
    }
    if (type === "PAYMENT.SALE.REFUNDED" || type === "PAYMENT.SALE.REVERSED") {
      const transactionId = resource.sale_id || resource.parent_payment || resource.id;
      const payment = transactionId ? await prisma.billingPayment.findFirst({ where: { provider: "PAYPAL", OR: [{ providerOrderId: transactionId }, { providerTransactionId: transactionId }] } }) : null;
      if (payment) {
        await prisma.billingPayment.update({ where: { id: payment.id }, data: { status: type.endsWith("REFUNDED") ? "REFUNDED" : "REVERSED", refundedAt: new Date(), metadata: resource } });
      }
    }
    await finishWebhookEvent("PAYPAL", eventId); return NextResponse.json({ received: true });
  } catch (error) { await finishWebhookEvent("PAYPAL", eventId, error); console.error("PayPal webhook failed", error); return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 }); }
}

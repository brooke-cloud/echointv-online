import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PRO_MONTHLY_PLAN } from "./plans";
import { beginWebhookEvent, finishWebhookEvent } from "./webhook-events";
import { syncUserProRole } from "./entitlements";

function validSignature(raw: string, header: string, secret: string) {
  const values = Object.fromEntries(header.split(";").map(part => part.split("=", 2))) as Record<string, string>;
  if (!values.ts || !values.h1 || Math.abs(Date.now() / 1000 - Number(values.ts)) > 300) return false;
  const expected = Buffer.from(createHmac("sha256", secret).update(`${values.ts}:${raw}`).digest("hex"));
  const supplied = Buffer.from(values.h1); return expected.length === supplied.length && timingSafeEqual(expected, supplied);
}
const asDate = (value?: string | null) => value ? new Date(value) : null;

export async function handlePaddleWebhook(request: Request) {
  const secret = process.env.PADDLE_WEBHOOK_SECRET_KEY;
  if (!secret) return NextResponse.json({ error: "Paddle webhook is not configured." }, { status: 503 });
  const raw = await request.text();
  if (!validSignature(raw, request.headers.get("paddle-signature") || "", secret)) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  let event: any; try { event = JSON.parse(raw); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const eventId = String(event.event_id || ""); const type = String(event.event_type || "");
  if (!eventId || !type) return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  if (!(await beginWebhookEvent("PADDLE", eventId, type, raw))) return NextResponse.json({ received: true, duplicate: true });
  try {
    const data = event.data || {};
    const knownSubscription = data.id && type.startsWith("subscription.") ? await prisma.billingSubscription.findUnique({ where: { provider_providerSubscriptionId: { provider: "PADDLE", providerSubscriptionId: data.id } } }) : data.subscription_id ? await prisma.billingSubscription.findUnique({ where: { provider_providerSubscriptionId: { provider: "PADDLE", providerSubscriptionId: data.subscription_id } } }) : null;
    const userId = data.custom_data?.userId || data.custom_data?.user_id || knownSubscription?.userId;
    if (type.startsWith("subscription.") && userId && data.id) {
      await prisma.billingSubscription.upsert({ where: { provider_providerSubscriptionId: { provider: "PADDLE", providerSubscriptionId: data.id } }, create: { userId, provider: "PADDLE", providerSubscriptionId: data.id, providerCustomerId: data.customer_id, planCode: data.custom_data?.planCode || PRO_MONTHLY_PLAN.code, status: String(data.status || type.split(".")[1]).toUpperCase(), currentPeriodStart: asDate(data.current_billing_period?.starts_at), currentPeriodEnd: asDate(data.current_billing_period?.ends_at), canceledAt: asDate(data.canceled_at), metadata: data }, update: { providerCustomerId: data.customer_id, status: String(data.status || type.split(".")[1]).toUpperCase(), currentPeriodStart: asDate(data.current_billing_period?.starts_at), currentPeriodEnd: asDate(data.current_billing_period?.ends_at), canceledAt: asDate(data.canceled_at), metadata: data } });
      await syncUserProRole(userId);
    }
    if (type === "transaction.completed" && userId && data.id) {
      await prisma.billingPayment.upsert({ where: { provider_providerOrderId: { provider: "PADDLE", providerOrderId: data.id } }, create: { userId, provider: "PADDLE", providerOrderId: data.id, planCode: data.custom_data?.planCode || PRO_MONTHLY_PLAN.code, amount: Number(data.details?.totals?.total || PRO_MONTHLY_PLAN.amount), currency: data.currency_code || "USD", status: "PAID", idempotencyKey: `paddle:${data.id}:completed`, paidAt: new Date(), metadata: data }, update: { status: "PAID", paidAt: new Date(), metadata: data } });
    }
    await finishWebhookEvent("PADDLE", eventId); return NextResponse.json({ received: true });
  } catch (error) { await finishWebhookEvent("PADDLE", eventId, error); console.error("Paddle webhook failed", error); return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 }); }
}

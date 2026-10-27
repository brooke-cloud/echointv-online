import "server-only";
import { getPayPalPlanId, PRO_MONTHLY_PLAN } from "./plans";
const baseUrl = () => process.env.PAYPAL_API || (process.env.PAYPAL_MODE === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com");

type PayPalSubscription = {
  id: string;
  plan_id?: string;
  custom_id?: string;
  status?: string;
  start_time?: string;
  subscriber?: { payer_id?: string; email_address?: string };
  billing_info?: { next_billing_time?: string; last_payment?: { time?: string } };
  links?: Array<{ rel: string; href: string }>;
};

async function paypalRequest<T>(path: string, init: RequestInit = {}) {
  const token = await getPayPalAccessToken();
  const response = await fetch(`${baseUrl()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
    cache: "no-store",
  });
  const data = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    const message = data?.details?.[0]?.description || data?.message || "PayPal request failed.";
    throw new Error(message);
  }
  return data as T;
}

export async function getPayPalAccessToken() {
  const id = process.env.PAYPAL_CLIENT_ID; const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!id || !secret) throw new Error("PayPal credentials are not configured.");
  const response = await fetch(`${baseUrl()}/v1/oauth2/token`, { method: "POST", headers: { Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`, "Content-Type": "application/x-www-form-urlencoded" }, body: "grant_type=client_credentials" });
  const data = await response.json(); if (!response.ok) throw new Error(data.error_description || "Unable to authenticate with PayPal."); return data.access_token as string;
}
export async function createPayPalSubscription(userId: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const data = await paypalRequest<PayPalSubscription>("/v1/billing/subscriptions", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify({ plan_id: getPayPalPlanId(), custom_id: userId, quantity: "1", application_context: { brand_name: "EchoINTV", user_action: "SUBSCRIBE_NOW", return_url: `${siteUrl}/checkout/success?provider=paypal`, cancel_url: `${siteUrl}/checkout?cancelled=1` } }) });
  const approveUrl = data.links?.find((link: { rel: string; href: string }) => link.rel === "approve")?.href; if (!approveUrl) throw new Error("PayPal approval URL is missing.");
  return { subscriptionId: data.id as string, approveUrl, plan: PRO_MONTHLY_PLAN };
}

export function getPayPalSubscription(subscriptionId: string) {
  return paypalRequest<PayPalSubscription>(`/v1/billing/subscriptions/${encodeURIComponent(subscriptionId)}`);
}

export async function cancelPayPalSubscription(subscriptionId: string, reason = "Cancelled by the customer") {
  await paypalRequest<null>(`/v1/billing/subscriptions/${encodeURIComponent(subscriptionId)}/cancel`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}
export async function verifyPayPalWebhook(headers: Headers, event: unknown) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID; if (!webhookId) throw new Error("PAYPAL_WEBHOOK_ID is not configured.");
  const token = await getPayPalAccessToken();
  const response = await fetch(`${baseUrl()}/v1/notifications/verify-webhook-signature`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ auth_algo: headers.get("paypal-auth-algo"), cert_url: headers.get("paypal-cert-url"), transmission_id: headers.get("paypal-transmission-id"), transmission_sig: headers.get("paypal-transmission-sig"), transmission_time: headers.get("paypal-transmission-time"), webhook_id: webhookId, webhook_event: event }) });
  const data = await response.json(); return response.ok && data.verification_status === "SUCCESS";
}

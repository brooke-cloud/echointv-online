"use client";

import { useState } from "react";
import { CalendarClock, Loader2 } from "lucide-react";
import { fetchJson } from "@/lib/fetch-json";

type Subscription = { provider: string; status: string; currentPeriodEnd: string | Date | null; cancelAtPeriodEnd: boolean };

export default function SubscriptionManager({ subscription }: { subscription: Subscription | null }) {
  const [current, setCurrent] = useState(subscription);
  const [confirming, setConfirming] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  if (!current) return null;

  const periodEnd = current.currentPeriodEnd ? new Date(current.currentPeriodEnd) : null;
  const dateText = periodEnd ? periodEnd.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : "not available";
  const isPending = current.status.toUpperCase() === "APPROVAL_PENDING";
  const canCancel = current.provider === "PAYPAL" && !current.cancelAtPeriodEnd && ["ACTIVE", "PAST_DUE", "SUSPENDED"].includes(current.status.toUpperCase());

  async function cancelSubscription() {
    setProcessing(true); setError("");
    try {
      const result = await fetchJson<{ currentPeriodEnd: string | null; discarded?: boolean }>("/api/billing/subscription/cancel", { method: "POST" });
      if (result.discarded) { setCurrent(null); return; }
      setCurrent({ ...current!, status: "CANCELLED", cancelAtPeriodEnd: true, currentPeriodEnd: result.currentPeriodEnd });
      setConfirming(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to cancel the subscription.");
    } finally { setProcessing(false); }
  }

  return <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm" aria-labelledby="billing-title">
    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
      <div><div className="flex items-center gap-2"><CalendarClock className="h-5 w-5 text-blue-600" /><h2 id="billing-title" className="font-bold text-gray-950">Billing and subscription</h2></div><p className="mt-2 text-sm text-gray-600">EchoINTV Pro · $5.00 USD per month · PayPal</p><p className="mt-1 text-sm text-gray-600">{isPending ? "Checkout was not completed. No payment was collected." : current.cancelAtPeriodEnd || ["CANCELLED", "CANCELED"].includes(current.status.toUpperCase()) ? `Cancelled. Access continues until ${dateText}.` : `Next renewal: ${dateText}.`}</p></div>
      {(canCancel || isPending) && !confirming && <button type="button" onClick={() => setConfirming(true)} className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">{isPending ? "Remove incomplete checkout" : "Cancel subscription"}</button>}
    </div>
    {confirming && <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4"><p className="text-sm font-semibold text-amber-950">{isPending ? "Remove this incomplete checkout?" : "Stop automatic renewal?"}</p><p className="mt-1 text-sm leading-6 text-amber-900">{isPending ? "This only removes the unpaid pending record from EchoINTV. No payment was collected." : `You will not be charged again. Your current Pro access remains available until ${dateText}.`}</p><div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={cancelSubscription} disabled={processing} className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{processing && <Loader2 className="h-4 w-4 animate-spin" />}{isPending ? "Remove record" : "Confirm cancellation"}</button><button type="button" onClick={() => setConfirming(false)} disabled={processing} className="rounded-lg border bg-white px-4 py-2 text-sm font-semibold text-gray-700">Keep it</button></div></div>}
    {error && <p aria-live="polite" className="mt-3 text-sm text-red-600">{error}</p>}
  </section>;
}

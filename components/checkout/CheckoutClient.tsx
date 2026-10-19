"use client";
import { useState } from "react";
import Link from "next/link";
import { AlertCircle, CreditCard, Loader2, ShieldCheck } from "lucide-react";
import { fetchJson, HttpError } from "@/lib/fetch-json";

declare global { interface Window { Paddle?: any } }
type Provider = "paddle" | "paypal";
function loadPaddle() { return new Promise<void>((resolve, reject) => { if (window.Paddle) return resolve(); const script = document.createElement("script"); script.src = "https://cdn.paddle.com/paddle/v2/paddle.js"; script.onload = () => resolve(); script.onerror = () => reject(new Error("Unable to load secure checkout.")); document.head.appendChild(script); }); }

export default function CheckoutClient() {
  const [processing, setProcessing] = useState<Provider | null>(null); const [error, setError] = useState("");
  async function checkout(provider: Provider) {
    if (processing) return; setProcessing(provider); setError("");
    try {
      const data = await fetchJson<any>("/api/billing/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ provider }) });
      if (provider === "paypal") { window.location.assign(data.approveUrl); return; }
      await loadPaddle();
      if (data.environment === "sandbox") window.Paddle.Environment.set("sandbox");
      window.Paddle.Initialize({ token: data.clientToken, eventCallback: (event: any) => { if (event.name === "checkout.completed") window.location.assign("/checkout/success?provider=paddle"); if (event.name === "checkout.closed") setProcessing(null); } });
      window.Paddle.Checkout.open({ items: [{ priceId: data.priceId, quantity: 1 }], customer: { email: data.customerEmail }, customData: data.customData, settings: { displayMode: "overlay", theme: "light", locale: "en", successUrl: `${window.location.origin}/checkout/success?provider=paddle` } });
    } catch (cause) {
      if (cause instanceof HttpError && cause.status === 401) { window.location.assign("/login?redirect=/checkout"); return; }
      setError(cause instanceof Error ? cause.message : "Checkout is temporarily unavailable."); setProcessing(null);
    }
  }
  return <main className="min-h-screen bg-gray-50 px-4 py-12"><div className="mx-auto max-w-4xl space-y-7">
    <div><Link href="/pricing" className="text-sm text-blue-600 hover:underline">← Back to pricing</Link><h1 className="mt-3 text-3xl font-extrabold text-gray-950">Upgrade to EchoINTV Pro</h1><p className="mt-2 text-gray-600">One subscription, more ways to pay.</p></div>
    <div className="grid gap-7 lg:grid-cols-12"><section className="rounded-3xl border bg-white p-7 shadow-sm lg:col-span-5"><h2 className="font-bold">Order summary</h2><div className="mt-6 flex justify-between"><div><p className="font-semibold">EchoINTV Pro</p><p className="text-sm text-gray-500">Monthly subscription</p></div><strong className="text-2xl">$6.90</strong></div><div className="mt-6 rounded-2xl bg-blue-50 p-4 text-sm text-blue-950">Renews automatically every month. Cancel anytime from your payment account. No card details are stored by EchoINTV.</div><div className="mt-6 border-t pt-5 text-right font-bold">$6.90 USD / month</div></section>
    <section className="space-y-4 rounded-3xl border bg-white p-7 shadow-sm lg:col-span-7"><h2 className="text-lg font-bold">Choose a payment method</h2><p className="text-sm text-gray-600">Paddle is recommended for cards and supported digital wallets. PayPal is also available directly.</p>
      {error && <div className="flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-5 w-5" />{error}</div>}
      <button onClick={() => checkout("paddle")} disabled={Boolean(processing)} className="flex w-full items-center justify-between rounded-xl bg-blue-600 px-5 py-4 font-bold text-white disabled:opacity-60"><span className="flex items-center gap-3"><CreditCard /> Card / Apple Pay / Google Pay</span>{processing === "paddle" ? <Loader2 className="animate-spin" /> : <span>Continue →</span>}</button>
      <button onClick={() => checkout("paypal")} disabled={Boolean(processing)} className="flex w-full items-center justify-between rounded-xl border-2 border-blue-200 px-5 py-4 font-bold text-blue-900 disabled:opacity-60"><span>PayPal</span>{processing === "paypal" ? <Loader2 className="animate-spin" /> : <span>Continue →</span>}</button>
      <p className="flex items-center justify-center gap-2 pt-2 text-xs text-gray-500"><ShieldCheck className="h-4 w-4 text-emerald-600" />Secure checkout provided by Paddle or PayPal.</p>
    </section></div></div></main>;
}

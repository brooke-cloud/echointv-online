"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, CreditCard, ShieldCheck } from "lucide-react";
import PayPalSubscriptionButtons from "./PayPalSubscriptionButtons";

export default function CheckoutClient() {
  const [error, setError] = useState("");

  return <main className="min-h-screen bg-gray-50 px-4 py-12">
    <div className="mx-auto max-w-4xl space-y-7">
      <div>
        <Link href="/pricing" className="text-sm text-blue-600 hover:underline">← Back to pricing</Link>
        <h1 className="mt-3 text-3xl font-extrabold text-gray-950">Upgrade to EchoINTV Pro</h1>
        <p className="mt-2 text-gray-600">Subscribe securely with PayPal or a credit or debit card.</p>
      </div>
      <div className="grid gap-7 lg:grid-cols-12">
        <section className="rounded-3xl border bg-white p-7 shadow-sm lg:col-span-5">
          <h2 className="font-bold">Order summary</h2>
          <div className="mt-6 flex justify-between gap-4">
            <div><p className="font-semibold">EchoINTV Pro</p><p className="text-sm text-gray-500">Monthly subscription</p></div>
            <strong className="text-2xl">$5.00</strong>
          </div>
          <div className="mt-6 rounded-2xl bg-blue-50 p-4 text-sm leading-6 text-blue-950">Renews automatically every month. Cancel anytime; access continues until the end of the paid billing period.</div>
          <div className="mt-6 border-t pt-5 text-right font-bold">$5.00 USD / month</div>
        </section>
        <section className="space-y-5 rounded-3xl border bg-white p-7 shadow-sm lg:col-span-7">
          <div>
            <div className="flex items-center gap-2"><CreditCard className="h-5 w-5 text-blue-600" /><h2 className="text-lg font-bold">Choose a payment method</h2></div>
            <p className="mt-2 text-sm leading-6 text-gray-600">Both options create the same $5.00 monthly subscription. Card details are handled securely by PayPal.</p>
          </div>
          {error && <div aria-live="polite" className="flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-5 w-5 shrink-0" />{error}</div>}
          <PayPalSubscriptionButtons onError={setError} />
          <p className="flex items-center justify-center gap-2 pt-2 text-xs text-gray-500"><ShieldCheck className="h-4 w-4 text-emerald-600" />EchoINTV never receives or stores your full card number.</p>
          <p className="text-center text-xs leading-5 text-gray-500">By subscribing, you authorize a recurring charge of $5.00 USD each month until cancelled and accept our <Link href="/terms" className="font-semibold text-blue-600 hover:underline">Terms</Link>, <Link href="/privacy" className="font-semibold text-blue-600 hover:underline">Privacy Policy</Link>, and <Link href="/refund-policy" className="font-semibold text-blue-600 hover:underline">Refund Policy</Link>.</p>
        </section>
      </div>
    </div>
  </main>;
}

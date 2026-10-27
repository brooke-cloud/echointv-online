import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "EchoINTV subscription cancellation and refund rules.",
  alternates: { canonical: "/refund-policy" },
};

export default function RefundPolicyPage() {
  return <main className="bg-slate-50 px-5 py-14 sm:py-20">
    <article className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-12">
      <p className="text-sm font-semibold text-blue-600">Billing</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Refund Policy</h1>
      <p className="mt-3 text-sm text-slate-500">Last updated: October 27, 2026</p>
      <div className="mt-10 space-y-8 text-[15px] leading-7 text-slate-700">
        <section><h2 className="text-xl font-bold text-slate-950">1. Subscription price</h2><p className="mt-2">EchoINTV Pro is a digital subscription charged at $5.00 USD per month. It renews automatically through PayPal until cancelled.</p></section>
        <section><h2 className="text-xl font-bold text-slate-950">2. First-purchase refund requests</h2><p className="mt-2">You may request a refund within seven calendar days of your first EchoINTV Pro payment. Approval is subject to review. We may decline a refund when the account has substantially accessed, copied, downloaded, or otherwise consumed paid content, or when we reasonably identify abuse or fraud.</p></section>
        <section><h2 className="text-xl font-bold text-slate-950">3. Renewal payments</h2><p className="mt-2">Automatic renewal payments are generally non-refundable. Exceptions may be considered for duplicate charges, confirmed technical failures that prevented access, unauthorized transactions handled with PayPal, or situations where applicable law requires a refund.</p></section>
        <section><h2 className="text-xl font-bold text-slate-950">4. Cancellation</h2><p className="mt-2">Cancelling stops future automatic charges but does not automatically refund the current billing period. Unless a refund is approved, Pro access remains available until the end of that paid period. You may cancel from your EchoINTV profile or directly through PayPal.</p></section>
        <section><h2 className="text-xl font-bold text-slate-950">5. How to request a refund</h2><p className="mt-2">Email <a className="font-semibold text-blue-600 hover:underline" href="mailto:echointv@gmail.com">echointv@gmail.com</a> with the email address used for EchoINTV, your PayPal transaction ID, payment date, and reason for the request. Do not send card numbers, passwords, or security codes.</p></section>
        <section><h2 className="text-xl font-bold text-slate-950">6. Processing</h2><p className="mt-2">We aim to review complete requests within seven business days. Approved refunds are returned through PayPal to the original payment method. Bank and payment-provider processing times may vary. Receiving a refund does not necessarily cancel future renewal, so you should also cancel the subscription.</p></section>
        <section><h2 className="text-xl font-bold text-slate-950">7. Local rights</h2><p className="mt-2">This policy does not limit mandatory consumer rights that apply in your location. Where local law provides greater protection, those requirements will apply.</p></section>
      </div>
    </article>
  </main>;
}

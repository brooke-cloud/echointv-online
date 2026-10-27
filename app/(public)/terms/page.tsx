import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms governing access to and use of EchoINTV.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return <main className="bg-slate-50 px-5 py-14 sm:py-20">
    <article className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-12">
      <p className="text-sm font-semibold text-blue-600">Legal</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Terms of Service</h1>
      <p className="mt-3 text-sm text-slate-500">Last updated: October 27, 2026</p>
      <div className="mt-10 space-y-8 text-[15px] leading-7 text-slate-700">
        <section><h2 className="text-xl font-bold text-slate-950">1. Agreement</h2><p className="mt-2">By creating an account, purchasing a subscription, or using EchoINTV, you agree to these Terms and our Privacy and Refund Policies. If you do not agree, do not use the service.</p></section>
        <section><h2 className="text-xl font-bold text-slate-950">2. Service</h2><p className="mt-2">EchoINTV provides digital software-engineering interview preparation materials, including questions, explanations, code examples, system-design content, and interview experience articles. Materials are educational and do not guarantee employment, interview success, or any particular outcome.</p></section>
        <section><h2 className="text-xl font-bold text-slate-950">3. Accounts</h2><p className="mt-2">You must provide accurate information, keep credentials confidential, and promptly notify us of unauthorized use. One account is for one person and may not be sold, shared, or transferred without permission.</p></section>
        <section><h2 className="text-xl font-bold text-slate-950">4. Subscription and automatic renewal</h2><p className="mt-2">EchoINTV Pro costs $5.00 USD per month unless a different price is clearly shown before purchase. The subscription renews automatically each month through PayPal until cancelled. Applicable taxes, conversion charges, or payment-provider fees may depend on your location and payment method.</p></section>
        <section><h2 className="text-xl font-bold text-slate-950">5. Cancellation</h2><p className="mt-2">You may cancel through your EchoINTV profile or PayPal account. Cancellation stops future renewals. Unless a refund is approved, Pro access continues until the end of the paid billing period. Removing an account does not automatically cancel an external PayPal subscription.</p></section>
        <section><h2 className="text-xl font-bold text-slate-950">6. Acceptable use</h2><p className="mt-2">You may not scrape or bulk-download content, share paid access, republish or resell materials, bypass access controls, interfere with the service, upload malicious code, or use EchoINTV unlawfully. Reasonable personal study use is permitted.</p></section>
        <section><h2 className="text-xl font-bold text-slate-950">7. Intellectual property</h2><p className="mt-2">EchoINTV and its original content, organization, branding, and software are protected by applicable intellectual-property laws. A subscription grants a limited, revocable, non-transferable right to use the service for personal preparation only.</p></section>
        <section><h2 className="text-xl font-bold text-slate-950">8. Availability and changes</h2><p className="mt-2">We may update content, correct errors, modify features, or temporarily suspend service for maintenance or security. We will provide reasonable notice before material subscription-price changes when required.</p></section>
        <section><h2 className="text-xl font-bold text-slate-950">9. Suspension and termination</h2><p className="mt-2">We may restrict or terminate access for payment failure, fraud, abuse, account sharing, infringement, security threats, or material violations of these Terms. Rights that logically survive termination remain effective.</p></section>
        <section><h2 className="text-xl font-bold text-slate-950">10. Disclaimers and liability</h2><p className="mt-2">The service is provided on an “as available” basis to the extent permitted by law. EchoINTV is not responsible for hiring decisions, third-party services, indirect losses, or events outside reasonable control. Nothing in these Terms excludes rights or liability that cannot legally be excluded.</p></section>
        <section><h2 className="text-xl font-bold text-slate-950">11. Contact</h2><p className="mt-2">Questions about these Terms may be sent to <a className="font-semibold text-blue-600 hover:underline" href="mailto:echointv@gmail.com">echointv@gmail.com</a>.</p></section>
      </div>
    </article>
  </main>;
}

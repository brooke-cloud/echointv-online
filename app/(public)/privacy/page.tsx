import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How EchoINTV collects, uses, and protects personal information.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPolicyPage() {
  return <main className="bg-slate-50 px-5 py-14 sm:py-20">
    <article className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-12">
      <p className="text-sm font-semibold text-blue-600">Legal</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Privacy Policy</h1>
      <p className="mt-3 text-sm text-slate-500">Last updated: October 27, 2026</p>
      <div className="mt-10 space-y-8 text-[15px] leading-7 text-slate-700">
        <section><h2 className="text-xl font-bold text-slate-950">1. Information we collect</h2><p className="mt-2">We collect information you provide when creating an account, including your name, email address, encrypted password credentials, account preferences, and communications with us. We also collect service activity such as saved questions, progress, membership status, and basic technical data needed to operate and secure the website.</p></section>
        <section><h2 className="text-xl font-bold text-slate-950">2. Payment information</h2><p className="mt-2">Payments are processed by PayPal. EchoINTV does not receive or store your complete card number or security code. We receive transaction identifiers, subscription status, payment status, billing dates, currency, and limited payer details needed to provide membership access, prevent fraud, handle refunds, and maintain financial records.</p></section>
        <section><h2 className="text-xl font-bold text-slate-950">3. How we use information</h2><p className="mt-2">We use information to create and secure accounts, provide interview-preparation content, manage subscriptions, remember preferences, respond to support requests, prevent abuse, improve the service, and comply with legal or accounting obligations.</p></section>
        <section><h2 className="text-xl font-bold text-slate-950">4. Cookies and analytics</h2><p className="mt-2">We use essential cookies for sign-in and security. We may use analytics to understand aggregate website usage and improve performance. You can restrict non-essential cookies through your browser, although disabling essential cookies may prevent account features from working.</p></section>
        <section><h2 className="text-xl font-bold text-slate-950">5. Sharing and service providers</h2><p className="mt-2">We share information only with service providers that help operate EchoINTV, such as hosting, email, analytics, database, and payment providers. We do not sell personal information. We may disclose information when required by law, to protect users, or to investigate fraud and security incidents.</p></section>
        <section><h2 className="text-xl font-bold text-slate-950">6. Retention and security</h2><p className="mt-2">We retain information for as long as reasonably necessary to provide the service, maintain transaction and audit records, resolve disputes, and meet legal obligations. We use access controls, encrypted connections, and payment-provider tokenization, but no online system can guarantee absolute security.</p></section>
        <section><h2 className="text-xl font-bold text-slate-950">7. Your choices and rights</h2><p className="mt-2">You may request access, correction, or deletion of your personal information, subject to legal and operational retention requirements. You may cancel a subscription from your profile or PayPal account. Privacy rights may vary by location.</p></section>
        <section><h2 className="text-xl font-bold text-slate-950">8. International processing and changes</h2><p className="mt-2">EchoINTV serves international users, so information may be processed in countries different from your own. We may update this policy when the service or legal requirements change and will post the revised date on this page.</p></section>
        <section><h2 className="text-xl font-bold text-slate-950">9. Contact</h2><p className="mt-2">For privacy questions or requests, contact <a className="font-semibold text-blue-600 hover:underline" href="mailto:echointv@gmail.com">echointv@gmail.com</a>.</p></section>
      </div>
    </article>
  </main>;
}

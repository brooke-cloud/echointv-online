"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronDown } from "lucide-react";
import { useLanguage } from "@/lib/use-language";

const copy = {
  en: {
    eyebrow: "Transparent pricing", title: "Choose the plan that fits your interview journey", subtitle: "Start free, then unlock the complete EchoINTV question bank and interview experience library when you are ready.",
    free: "Free", freeDesc: "Explore the platform and begin practicing with selected interview content.", forever: "forever", included: "What’s included", freeFeatures: ["Access selected interview questions", "Read selected interview experiences", "Use the coding practice workspace", "Save favorites and practice notes"], freeCta: "Start for free",
    pro: "Pro", popular: "Most popular", proDesc: "Full access for candidates preparing seriously for technical interviews.", month: "month", proFeatures: ["Unlock all interview questions", "Unlock all interview experience articles", "View complete solutions and complexity analysis", "Access AI interview analysis and follow-up guidance", "Receive newly published content continuously"], proCta: "Get EchoINTV Pro — $5/month",
    faq: "Frequently asked questions", faqDesc: "Everything you need to know about plans and billing.", faqs: [
      ["What is included in the Free plan?", "The Free plan gives you access to selected questions and interview experiences, plus the core practice workspace."],
      ["What do I unlock with Pro?", "Pro unlocks the full question bank, interview experiences, reference solutions, complexity analysis, and AI-assisted interview guidance."],
      ["How does billing work?", "EchoINTV Pro costs $5.00 USD per month and renews automatically until you cancel."],
      ["Which payment methods are supported?", "You can subscribe with PayPal or an eligible credit or debit card. Payments are processed securely by PayPal."],
      ["Can I cancel at any time?", "Yes. You can cancel from your profile. Your access continues until the end of the current paid billing period."],
    ],
  },
  zh: {
    eyebrow: "透明定价", title: "选择适合你的面试准备方案", subtitle: "先免费体验；准备好后，再解锁完整题库、面经、参考答案与 AI 面试分析。",
    free: "免费版", freeDesc: "体验平台核心功能，并使用精选面试内容开始练习。", forever: "永久免费", included: "包含权益", freeFeatures: ["查看精选面试题", "阅读精选面经", "使用在线代码练习工作区", "保存收藏和练习笔记"], freeCta: "免费开始",
    pro: "Pro 会员", popular: "最受欢迎", proDesc: "适合认真准备技术面试、希望完整使用平台内容的求职者。", month: "月", proFeatures: ["解锁全部面试题", "解锁全部面经文章", "查看完整答案和复杂度分析", "使用 AI 面试分析与追问指导", "持续获得最新发布内容"], proCta: "开通 Pro 会员 — 每月 $5",
    faq: "常见问题", faqDesc: "关于会员方案和付款的常见问题。", faqs: [
      ["免费版包含哪些内容？", "免费版可以查看精选题目与面经，并使用核心代码练习工作区。"],
      ["Pro 会员可以解锁什么？", "Pro 可解锁完整题库、全部面经、参考答案、复杂度分析和 AI 面试指导。"],
      ["会员如何计费？", "EchoINTV Pro 每月收费 5 美元，并会自动续费，直到你主动取消。"],
      ["支持哪些付款方式？", "你可以使用 PayPal 或符合条件的信用卡、借记卡订阅。付款由 PayPal 安全处理。"],
      ["可以随时取消吗？", "可以。你可以在个人中心取消订阅，会员权益会保留至当前已付款周期结束。"],
    ],
  },
} as const;

export default function PricingPageContent() {
  const { language } = useLanguage();
  const t = copy[language];
  const [open, setOpen] = useState(0);
  const Feature = ({ children }: { children: string }) => <li className="flex gap-3 text-sm leading-6 text-slate-700"><Check className="mt-1 h-4 w-4 shrink-0 text-blue-600" /><span>{children}</span></li>;

  return <main className="min-h-screen bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-6xl">
      <header className="mx-auto max-w-3xl text-center"><span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-700">{t.eyebrow}</span><h1 className="mt-5 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">{t.title}</h1><p className="mt-5 text-base leading-7 text-slate-600 sm:text-lg">{t.subtitle}</p></header>
      <section className="mt-14 grid gap-8 md:grid-cols-2">
        <article className="flex flex-col rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10"><h2 className="text-2xl font-black text-slate-950">{t.free}</h2><p className="mt-3 min-h-12 text-sm leading-6 text-slate-600">{t.freeDesc}</p><div className="my-7"><span className="text-5xl font-black text-slate-950">$0</span><span className="ml-2 text-sm text-slate-500">/ {t.forever}</span></div><p className="border-t border-slate-100 pt-6 text-xs font-bold uppercase tracking-wider text-slate-400">{t.included}</p><ul className="mt-4 flex-1 space-y-3">{t.freeFeatures.map((item) => <Feature key={item}>{item}</Feature>)}</ul><Link href="/register" className="mt-10 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-center text-sm font-bold text-slate-900 transition hover:bg-slate-100">{t.freeCta} →</Link></article>
        <article className="relative flex flex-col rounded-3xl border-2 border-blue-600 bg-white p-8 shadow-xl shadow-blue-100 sm:p-10"><span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-4 py-1 text-xs font-bold text-white shadow">{t.popular}</span><h2 className="text-2xl font-black text-slate-950">{t.pro}</h2><p className="mt-3 min-h-12 text-sm leading-6 text-slate-600">{t.proDesc}</p><div className="my-7"><span className="text-5xl font-black text-slate-950">$5.00</span><span className="ml-2 text-sm text-slate-500">/ {t.month}</span></div><p className="border-t border-slate-100 pt-6 text-xs font-bold uppercase tracking-wider text-slate-400">{t.included}</p><ul className="mt-4 flex-1 space-y-3">{t.proFeatures.map((item) => <Feature key={item}>{item}</Feature>)}</ul><Link href="/checkout" className="mt-10 rounded-xl bg-blue-600 px-4 py-3.5 text-center text-sm font-bold text-white shadow-md transition hover:bg-blue-700">{t.proCta} →</Link></article>
      </section>
      <section className="mx-auto mt-20 max-w-3xl"><div className="text-center"><h2 className="text-3xl font-black text-slate-950">{t.faq}</h2><p className="mt-2 text-sm text-slate-500">{t.faqDesc}</p></div><div className="mt-8 space-y-3">{t.faqs.map(([question, answer], index) => <article key={question} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><button type="button" aria-expanded={open === index} onClick={() => setOpen(open === index ? -1 : index)} className="flex w-full items-center justify-between gap-4 p-5 text-left font-bold text-slate-900 transition hover:text-blue-600"><span>{question}</span><ChevronDown className={`h-5 w-5 shrink-0 transition ${open === index ? "rotate-180" : ""}`} /></button>{open === index && <p className="border-t border-slate-100 px-5 py-4 text-sm leading-6 text-slate-600">{answer}</p>}</article>)}</div></section>
    </div>
  </main>;
}

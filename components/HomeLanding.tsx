"use client";

import Link from "next/link";
import {
  ArrowRight, Bookmark, Bot, BriefcaseBusiness, Building2, CalendarDays,
  Check, ChevronRight, Eye, FileText, MessageCircle, Search, Sparkles,
  Target, Users, WandSparkles,
} from "lucide-react";
import { useLanguage } from "@/lib/use-language";

type QuestionPreview = {
  id: number;
  slug: string;
  title: string;
  company: string;
  difficulty: string;
  category: string;
  description: string;
};

type ExperiencePreview = {
  id: number;
  slug: string;
  title: string;
  company?: string | null;
  category: string;
  description: string;
  date: string;
};

type HomeLandingProps = {
  totalProblems: number;
  totalPosts: number;
  companyCount: number;
  questions: QuestionPreview[];
  experiences: ExperiencePreview[];
};

const companyStyle: Record<string, string> = {
  Google: "text-blue-600", Amazon: "text-slate-950", Meta: "text-blue-600",
  Microsoft: "text-sky-600", Apple: "text-slate-900", TikTok: "text-slate-950",
  NVIDIA: "text-lime-600", Databricks: "text-red-500", Snowflake: "text-sky-500", Palantir: "text-slate-900",
};

function CompanyMark({ company }: { company: string }) {
  const letter = company === "Meta" ? "∞" : company.slice(0, 1).toUpperCase();
  return <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-xl font-black ${companyStyle[company] || "text-blue-600"}`}>{letter}</span>;
}

export default function HomeLanding({ totalProblems, totalPosts, companyCount, questions, experiences }: HomeLandingProps) {
  const { language } = useLanguage();
  const zh = language === "zh";
  const topCompanies = ["Google", "Amazon", "Meta", "Microsoft", "Apple", "TikTok", "NVIDIA", "Databricks", "Snowflake", "Palantir"];

  const copy = zh ? {
    badge: "为国际学生打造的 AI 面试平台",
    titleA: "掌握大厂面试。", titleB: "拿下理想 Offer。",
    subtitle: "汇集 Google、Meta、Amazon、TikTok 等公司的真实面试题、深度解析与 AI 分析，为冲刺科技公司的国际学生而打造。",
    primary: "探索面试真题", secondary: "查看真实面经",
    benefits: ["真实面试题", "AI 智能分析", "个性化备战计划", "中英双语解析"],
    companies: "覆盖全球顶尖科技公司",
    stats: ["真实面试题", "深度面试经验", "顶尖科技公司"],
    why: "为什么选择 ECHOINTV", more: "不只是一个题库",
    whyDesc: "真实面试数据、AI 深度分析与 Offer 导向的备战路径，帮助国际学生更高效地赢得技术面试。",
    features: [
      ["真实面试情报", "来自真实候选人的高质量题目与完整面试流程。"],
      ["AI 智能分析", "理解面试官意图、识别核心考点并优化你的答案。"],
      ["Offer 导向备战", "根据真实经验生成个性化学习计划，持续接近理想 Offer。"],
    ],
    explore: "探索真实面试内容", exploreDesc: "来自顶尖科技公司的高质量面试题与候选人经验。",
    viewAll: "查看全部内容", experiencesTitle: "真实面试经历", experiencesDesc: "了解候选人在顶尖公司的真实面试流程。",
    ctaEyebrow: "准备好开始了吗？", cta: "加入 EchoINTV，离理想 Offer 更近一步", ctaDesc: "解锁真实面试题、AI 分析与个性化备战计划。", ctaButton: "免费开始",
  } : {
    badge: "AI interview intelligence for international talent",
    titleA: "Master Big Tech Interviews.", titleB: "Land Your Dream Offer.",
    subtitle: "Real interview questions, detailed solutions, and AI-powered analysis from Google, Meta, Amazon, TikTok and more. Built for international students preparing for Big Tech careers.",
    primary: "Explore Interview Questions", secondary: "View Real Interview Experiences",
    benefits: ["Real interview questions", "AI-powered analysis", "Personalized preparation plan", "Bilingual explanations"],
    companies: "Trusted interview data from top companies",
    stats: ["Real Interview Questions", "In-depth Interview Experiences", "Big Tech Companies"],
    why: "WHY ECHOINTV", more: "More Than Just a Question Bank",
    whyDesc: "We combine real interview data, AI-powered analysis, and proven preparation strategies to help international students succeed in tech interviews.",
    features: [
      ["Real Interview Intelligence", "Questions from real candidates and high-quality, step-by-step hiring processes."],
      ["AI-Powered Analysis", "Understand interviewer intent, identify key areas, and improve your answers."],
      ["Offer-Oriented Preparation", "Personalized study plans from real experience to help you land your dream offer."],
    ],
    explore: "Explore Real Interview Content", exploreDesc: "High-quality questions and interview experiences from top tech companies.",
    viewAll: "View All Content", experiencesTitle: "Interview Experiences", experiencesDesc: "Browse real interview experiences from candidates who interviewed at top tech companies.",
    ctaEyebrow: "READY TO START?", cta: "Join EchoINTV and Get Closer to Your Dream Offer", ctaDesc: "Access real interview questions, AI analysis, and personalized study plans.", ctaButton: "Get Started for Free",
  };

  const fallbackQuestions: QuestionPreview[] = [
    { id: 901, slug: "design-url-shortener", title: "Design a URL Shortener", company: "Google", difficulty: "Medium", category: "System Design", description: "Design a scalable URL shortener like bit.ly. How would you handle redirects, storage, and traffic spikes?" },
    { id: 902, slug: "lru-cache", title: "Implement an LRU Cache", company: "Amazon", difficulty: "Medium", category: "Algorithms", description: "Design and implement an efficient LRU cache with constant-time access and eviction." },
    { id: 903, slug: "behavioral", title: "Behavioral Interview Questions", company: "Meta", difficulty: "Easy", category: "Behavioral", description: "Common behavioral questions and answer frameworks for Meta interviews." },
    { id: 904, slug: "design-youtube", title: "Design YouTube", company: "TikTok", difficulty: "Hard", category: "System Design", description: "Design a global video sharing platform with resilient upload and streaming workflows." },
  ];
  const visibleQuestions = [...questions, ...fallbackQuestions].slice(0, 4);

  return (
    <main className="w-full max-w-[100vw] overflow-hidden bg-white text-slate-950">
      <section className="relative w-full max-w-[100vw] overflow-hidden border-b border-slate-100 bg-[radial-gradient(circle_at_85%_15%,rgba(99,102,241,0.14),transparent_28%),radial-gradient(circle_at_15%_5%,rgba(59,130,246,0.10),transparent_28%)]">
        <div className="mx-auto grid w-full min-w-0 grid-cols-[minmax(0,1fr)] gap-14 px-4 pb-12 pt-16 sm:px-6 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,.98fr)] lg:px-10 lg:pt-20 2xl:px-14">
          <div className="flex w-full min-w-0 max-w-[calc(100vw-40px)] flex-col justify-center sm:max-w-none">
            <div className="mb-7 inline-flex w-fit items-center gap-2 rounded-full border border-blue-100 bg-blue-50/80 px-4 py-2 text-xs font-bold text-blue-700 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" /> {copy.badge}
            </div>
            <h1 className="max-w-3xl break-words text-[42px] font-black leading-[1.04] tracking-[-0.055em] text-slate-950 sm:text-6xl lg:text-[68px]">
              {copy.titleA}<br /><span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">{copy.titleB}</span>
            </h1>
            <p className="mt-7 w-full min-w-0 max-w-[calc(100vw-40px)] break-words text-base leading-8 text-slate-600 sm:max-w-2xl sm:text-lg">{copy.subtitle}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/problem" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-4 text-sm font-bold text-white shadow-xl shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700">{copy.primary}<ArrowRight className="h-4 w-4" /></Link>
              <Link href="/blog" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-bold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200"><FileText className="h-4 w-4 text-blue-600" />{copy.secondary}</Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-slate-600">
              {copy.benefits.map((benefit) => <span key={benefit} className="flex items-center gap-1.5"><Check className="h-4 w-4 text-blue-600" />{benefit}</span>)}
            </div>
          </div>

          <DashboardPreview />
        </div>

        <div className="mx-auto w-full px-4 pb-14 sm:px-6 lg:px-10 2xl:px-14">
          <p className="mb-5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-500">{copy.companies}</p>
          <div className="flex flex-wrap items-center justify-between gap-5">
            {topCompanies.map((company) => <div key={company} className="flex items-center gap-2 text-sm font-bold text-slate-700"><span className={`text-lg font-black ${companyStyle[company]}`}>{company === "Meta" ? "∞" : company[0]}</span>{company}</div>)}
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {[[`${totalProblems || 73}+`, copy.stats[0], FileText], [`${totalPosts || 30}+`, copy.stats[1], MessageCircle], [`${companyCount || 16}+`, copy.stats[2], Building2]].map(([value, label, Icon]) => {
              const StatIcon = Icon as typeof FileText;
              return <div key={String(label)} className="flex items-center gap-5 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.05)]"><span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><StatIcon className="h-7 w-7" /></span><div><div className="text-3xl font-black tracking-tight">{value as string}</div><div className="mt-1 text-sm text-slate-500">{label as string}</div></div></div>;
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#06142e] text-white">
        <div className="mx-auto grid w-full gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_1.45fr] lg:px-10 2xl:px-14">
          <div className="flex flex-col justify-center">
            <p className="text-xs font-extrabold tracking-[0.16em] text-cyan-400">{copy.why}</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{copy.more}</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">{copy.whyDesc}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {copy.features.map(([title, description], index) => {
              const icons = [FileText, WandSparkles, Target]; const Icon = icons[index];
              return <article key={title} className="rounded-2xl border border-white/10 bg-white/[0.055] p-5 shadow-2xl"><span className={`flex h-11 w-11 items-center justify-center rounded-xl ${index === 0 ? "bg-blue-500" : index === 1 ? "bg-violet-500" : "bg-emerald-500"}`}><Icon className="h-5 w-5" /></span><h3 className="mt-5 text-base font-bold">{title}</h3><p className="mt-2 text-xs leading-6 text-slate-300">{description}</p></article>;
            })}
          </div>
        </div>
      </section>

      <section className="bg-slate-50/70">
        <div className="mx-auto w-full px-4 py-20 sm:px-6 lg:px-10 2xl:px-14">
          <SectionHeading title={copy.explore} description={copy.exploreDesc} action={copy.viewAll} href="/problem" />
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {visibleQuestions.map((question, index) => <QuestionCard key={`${question.id}-${index}`} question={question} />)}
          </div>

          <div className="mt-20">
            <SectionHeading title={copy.experiencesTitle} description={copy.experiencesDesc} action={zh ? "查看全部面经" : "View All Experiences"} href="/blog" />
            <div className="mt-8 grid gap-5 lg:grid-cols-3">
              {(experiences.length ? experiences : [
                { id: 1, slug: "google-swe-intern", title: "Google SWE Intern", company: "Google", category: "Software Engineer Intern", description: "Online assessment, technical rounds, behavioral interview, and final team matching.", date: "Mar 2026" },
                { id: 2, slug: "amazon-sde", title: "Amazon SDE", company: "Amazon", category: "Software Development Engineer", description: "Coding, system design, and behavioral rounds with a strong focus on leadership principles.", date: "Jan 2026" },
                { id: 3, slug: "meta-mle", title: "Meta MLE", company: "Meta", category: "Machine Learning Engineer", description: "ML system design, coding, product sense, and applied machine learning interviews.", date: "Nov 2025" },
              ]).slice(0, 3).map((experience, index) => <ExperienceCard key={`${experience.id}-${index}`} experience={experience} />)}
            </div>
          </div>

          <div className="mt-20 flex flex-col items-center gap-7 rounded-3xl border border-blue-100 bg-[linear-gradient(120deg,#eef2ff,#f8fbff_55%,#e8f5ff)] px-7 py-10 text-center shadow-sm lg:flex-row lg:text-left">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-white text-blue-600 shadow-lg"><BriefcaseBusiness className="h-10 w-10" /></div>
            <div className="flex-1"><p className="text-xs font-extrabold tracking-[0.14em] text-blue-600">{copy.ctaEyebrow}</p><h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{copy.cta}</h2><p className="mt-2 text-sm text-slate-500">{copy.ctaDesc}</p></div>
            <Link href="/register" className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-blue-600 px-7 py-4 text-sm font-bold text-white shadow-xl shadow-blue-600/20 hover:bg-blue-700">{copy.ctaButton}<ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function DashboardPreview() {
  const menu = [[FileText, "Questions"], [MessageCircle, "Experiences"], [Bot, "AI Coach"], [Target, "Study Plan"], [Bookmark, "Bookmarks"]] as const;
  const analysis = ["Interview Intent", "Key Concepts", "Answer Framework", "Common Mistakes", "Follow-up Questions", "Sample Answer"];
  return (
    <div className="relative mx-auto w-full min-w-0 max-w-[calc(100vw-32px)] py-8 sm:max-w-none lg:py-0">
      <div className="absolute -right-4 -top-4 rotate-[-4deg] font-semibold text-indigo-600">Your AI Interview Coach ✦</div>
      <div className="grid min-h-[430px] min-w-0 grid-cols-[100px_minmax(0,1fr)] overflow-hidden rounded-[28px] border border-blue-100 bg-white shadow-[0_30px_90px_rgba(37,99,235,0.18)] sm:grid-cols-[150px_minmax(0,1fr)]">
        <aside className="border-r border-slate-100 bg-slate-50/80 p-4">
          <div className="mb-6 flex items-center gap-2 text-sm font-black"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white"><Sparkles className="h-4 w-4" /></span>EchoINTV</div>
          <div className="space-y-2">{menu.map(([Icon, label], index) => <div key={label} className={`flex items-center gap-2 rounded-xl px-2.5 py-2 text-[11px] font-semibold ${index === 0 ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-500"}`}><Icon className="h-3.5 w-3.5" />{label}</div>)}</div>
        </aside>
        <div className="relative min-w-0 p-4 sm:p-7">
          <div className="flex items-center justify-between"><div><div className="text-xs font-bold text-blue-600">SYSTEM DESIGN</div><div className="mt-1 text-xl font-black">Design a URL Shortener</div></div><Search className="h-4 w-4 text-slate-400" /></div>
          <div className="mt-5 flex gap-1 border-b border-slate-100 pb-3 text-[10px] font-semibold text-slate-400"><span className="rounded-lg bg-blue-50 px-2 py-1 text-blue-600">Question</span><span className="px-2 py-1">Solution</span><span className="px-2 py-1">Discussion</span><span className="px-2 py-1">AI Analysis</span></div>
          <div className="mt-5 rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex flex-wrap items-center gap-2 text-[10px]"><CompanyMark company="Google" /><span className="rounded-md bg-slate-100 px-2 py-1">Google</span><span className="rounded-md bg-amber-50 px-2 py-1 text-amber-700">Medium</span></div>
            <p className="mt-4 text-xs leading-6 text-slate-600">Design a scalable URL shortener like bit.ly. Explain your data model, redirect flow, caching strategy, and trade-offs.</p>
            <button className="mt-5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white">View Solution →</button>
          </div>
          <div className="absolute -bottom-5 -right-3 w-[205px] rounded-2xl border border-violet-100 bg-white p-4 shadow-[0_20px_60px_rgba(79,70,229,0.20)] sm:-right-7">
            <div className="mb-3 flex items-center gap-2 font-black"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600 text-white"><Sparkles className="h-4 w-4" /></span>AI Analysis</div>
            <div className="space-y-1">{analysis.map((item) => <div key={item} className="flex items-center justify-between rounded-lg px-2 py-1.5 text-[10px] font-semibold text-slate-600 hover:bg-violet-50"><span className="flex items-center gap-1.5"><Check className="h-3 w-3 text-emerald-500" />{item}</span><ChevronRight className="h-3 w-3 text-slate-300" /></div>)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionHeading({ title, description, action, href }: { title: string; description: string; action: string; href: string }) {
  return <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h2 className="text-3xl font-black tracking-tight text-slate-950">{title}</h2><p className="mt-2 text-sm text-slate-500">{description}</p></div><Link href={href} className="flex items-center gap-2 text-sm font-bold text-blue-600">{action}<ArrowRight className="h-4 w-4" /></Link></div>;
}

function QuestionCard({ question }: { question: QuestionPreview }) {
  return <Link href={`/problem/${question.slug}`} className="group flex min-h-[270px] flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-950/5">
    <CompanyMark company={question.company} />
    <h3 className="mt-5 text-base font-black text-slate-900 group-hover:text-blue-600">{question.title}</h3>
    <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-semibold"><span className="rounded-md bg-slate-100 px-2 py-1 text-slate-600">{question.category}</span><span className="rounded-md bg-blue-50 px-2 py-1 text-blue-600">{question.company}</span><span className="rounded-md bg-amber-50 px-2 py-1 text-amber-700">{question.difficulty}</span></div>
    <p className="mt-4 line-clamp-3 flex-1 text-xs leading-6 text-slate-500">{question.description}</p>
    <div className="mt-5 flex items-center gap-4 border-t border-slate-100 pt-4 text-[11px] text-slate-400"><span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{(6.3 + question.id % 7).toFixed(1)}K</span><span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{180 + question.id % 190}</span><Bookmark className="ml-auto h-4 w-4" /></div>
  </Link>;
}

function ExperienceCard({ experience }: { experience: ExperiencePreview }) {
  const company = experience.company || experience.title.split(" ")[0] || "Tech";
  return <Link href={`/blog/${experience.slug}`} className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-950/5">
    <div className="flex items-center gap-3"><CompanyMark company={company} /><div><h3 className="font-black text-slate-900 group-hover:text-blue-600">{experience.title}</h3><p className="mt-0.5 text-xs text-slate-400">{company}</p></div></div>
    <div className="mt-5 flex flex-wrap gap-2 text-[10px] font-semibold"><span className="rounded-md bg-slate-100 px-2 py-1 text-slate-600">{experience.category}</span><span className="rounded-md bg-blue-50 px-2 py-1 text-blue-600">4–5 Rounds</span><span className="rounded-md bg-emerald-50 px-2 py-1 text-emerald-700">Real Experience</span></div>
    <p className="mt-4 line-clamp-3 text-xs leading-6 text-slate-500">{experience.description}</p>
    <div className="mt-5 flex items-center gap-4 border-t border-slate-100 pt-4 text-[11px] text-slate-400"><span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />Anonymous</span><span className="ml-auto flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{experience.date}</span><Bookmark className="h-4 w-4" /></div>
  </Link>;
}

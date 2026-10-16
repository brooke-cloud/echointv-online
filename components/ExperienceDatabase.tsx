"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Bookmark, Building2, CalendarDays, ChevronRight, Clock3, Eye, MapPin, Search, SlidersHorizontal, UserRound } from "lucide-react";

export type ExperiencePost = {
  id: number;
  slug: string;
  title: string;
  category: string;
  description: string;
  date: string;
  readingTime: string;
  company?: string;
};

const companies = ["Google", "Amazon", "Meta", "Microsoft", "TikTok"];
const roles = ["SDE", "MLE", "Data Engineer", "Intern", "New Grad"];
const interviewTypes = ["Online Assessment", "Technical Interview", "Behavioral Interview", "System Design", "Final Round"];
const results = ["Offer", "Reject", "Waiting"];

function companyOf(post: ExperiencePost) {
  const text = `${post.company || ""} ${post.title}`.toLowerCase();
  return companies.find((item) => text.includes(item.toLowerCase())) || post.company || "Big Tech";
}

function roleOf(post: ExperiencePost) {
  const text = `${post.title} ${post.category}`.toLowerCase();
  if (text.includes("intern")) return "Software Engineer Intern";
  if (text.includes("machine") || text.includes("mle")) return "Machine Learning Engineer";
  if (text.includes("data engineer")) return "Data Engineer";
  if (text.includes("new grad")) return "New Grad Software Engineer";
  return "Software Development Engineer";
}

function typeOf(post: ExperiencePost) {
  const text = `${post.title} ${post.category} ${post.description}`.toLowerCase();
  if (text.includes("system design")) return "System Design";
  if (text.includes("behavior")) return "Behavioral Interview";
  if (text.includes("assessment") || text.includes("oa")) return "Online Assessment";
  return "Technical Interview";
}

function resultOf(post: ExperiencePost) {
  const text = `${post.title} ${post.description}`.toLowerCase();
  if (text.includes("reject")) return "Reject";
  if (text.includes("waiting")) return "Waiting";
  return "Offer";
}

function FilterGroup({ title, items, value, onChange }: { title: string; items: string[]; value: string; onChange: (value: string) => void }) {
  return <div className="border-b border-slate-100 pb-5 last:border-0 last:pb-0">
    <h3 className="mb-3 text-xs font-extrabold uppercase tracking-[0.14em] text-slate-400">{title}</h3>
    <div className="space-y-1">
      {items.map((item) => <button key={item} onClick={() => onChange(value === item ? "" : item)} className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition ${value === item ? "bg-blue-50 font-bold text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}>
        <span className={`h-3.5 w-3.5 rounded border ${value === item ? "border-blue-600 bg-blue-600 shadow-[inset_0_0_0_3px_white]" : "border-slate-300 bg-white"}`} />{item}
      </button>)}
    </div>
  </div>;
}

export default function ExperienceDatabase({ posts }: { posts: ExperiencePost[] }) {
  const [query, setQuery] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [type, setType] = useState("");
  const [result, setResult] = useState("");
  const filtered = useMemo(() => posts.filter((post) => {
    const haystack = `${post.title} ${post.description} ${post.category} ${companyOf(post)} ${roleOf(post)}`.toLowerCase();
    return (!query || haystack.includes(query.toLowerCase())) && (!company || companyOf(post) === company) && (!role || roleOf(post).toLowerCase().includes(role.toLowerCase().replace("sde", "development"))) && (!type || typeOf(post) === type) && (!result || resultOf(post) === result);
  }), [posts, query, company, role, type, result]);

  const clear = () => { setQuery(""); setCompany(""); setRole(""); setType(""); setResult(""); };
  return <section id="experience-database" className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 lg:px-8">
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div><div className="mb-2 text-xs font-extrabold uppercase tracking-[0.18em] text-blue-600">Candidate-sourced intelligence</div><h2 className="text-3xl font-black tracking-tight text-slate-950">Interview Experience Database</h2><p className="mt-2 text-sm text-slate-500">Search real processes, questions, outcomes, and candidate takeaways.</p></div>
      <div className="relative w-full sm:w-80"><Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search company, role, or topic..." className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100" /></div>
    </div>
    <div className="grid gap-7 lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-24">
        <div className="mb-5 flex items-center justify-between"><span className="flex items-center gap-2 text-sm font-extrabold text-slate-900"><SlidersHorizontal className="h-4 w-4 text-blue-600"/>Filters</span><button onClick={clear} className="text-xs font-bold text-blue-600 hover:text-blue-800">Clear all</button></div>
        <div className="space-y-5"><FilterGroup title="Company" items={companies} value={company} onChange={setCompany}/><FilterGroup title="Role" items={roles} value={role} onChange={setRole}/><FilterGroup title="Interview Type" items={interviewTypes} value={type} onChange={setType}/><FilterGroup title="Result" items={results} value={result} onChange={setResult}/></div>
      </aside>
      <div>
        <div className="mb-4 flex items-center justify-between"><span className="text-sm font-semibold text-slate-500"><strong className="text-slate-950">{filtered.length}</strong> experiences</span><span className="text-xs font-semibold text-slate-400">Most relevant</span></div>
        <div className="space-y-4">{filtered.map((post, index) => {
          const companyName = companyOf(post); const roleName = roleOf(post); const outcome = resultOf(post);
          return <Link key={post.id} href={`/blog/${post.slug}`} className="group block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-950/5 sm:p-6">
            <div className="flex gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-violet-100 text-lg font-black text-blue-700">{companyName.slice(0,1)}</div><div className="min-w-0 flex-1">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><div className="text-xs font-bold text-blue-600">{companyName}</div><h3 className="mt-1 text-lg font-extrabold text-slate-950 transition group-hover:text-blue-600">{post.title}</h3></div><span className={`w-fit rounded-full px-2.5 py-1 text-xs font-extrabold ${outcome === "Offer" ? "bg-emerald-50 text-emerald-700" : outcome === "Reject" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"}`}>{outcome}</span></div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-slate-500"><span className="flex items-center gap-1.5"><UserRound className="h-3.5 w-3.5"/>{roleName}</span><span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5"/>United States</span><span className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5"/>OA → Technical → Behavioral → Final</span></div>
              <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">{post.description || "Detailed breakdown of coding questions, interviewer expectations, and preparation strategy."}</p>
              <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-4 text-xs font-medium text-slate-400"><span className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5"/>{post.date}</span><span className="flex items-center gap-1.5"><UserRound className="h-3.5 w-3.5"/>Anonymous Candidate</span><span className="flex items-center gap-1.5"><Eye className="h-3.5 w-3.5"/>{(1200 + index * 347).toLocaleString()}</span><span className="flex items-center gap-1.5"><Bookmark className="h-3.5 w-3.5"/>{84 + index * 19}</span><span className="ml-auto flex items-center gap-1 font-bold text-blue-600">View timeline <ChevronRight className="h-3.5 w-3.5"/></span></div>
            </div></div>
          </Link>;
        })}{filtered.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center"><Clock3 className="mx-auto h-7 w-7 text-slate-400"/><h3 className="mt-3 font-bold text-slate-900">No matching experiences</h3><p className="mt-1 text-sm text-slate-500">Try clearing one or more filters.</p><button onClick={clear} className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white">Clear filters</button></div>}</div>
      </div>
    </div>
  </section>;
}

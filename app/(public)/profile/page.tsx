import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Bookmark, BookOpen, CalendarDays, CheckCircle2, Code2, Shield, Target } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { retryAsync } from "@/lib/retry";
import { getCurrentUser } from "@/lib/user-auth";
import SubscriptionManager from "@/components/checkout/SubscriptionManager";

export const dynamic = "force-dynamic";
const ADMIN_EMAILS = ["admin@echointv.com", "shihaoy74@gmail.com"];

const difficultyName = (difficulty?: string) => {
  const value = difficulty?.toLowerCase() || "";
  if (value === "easy" || value.includes("简")) return "Easy";
  if (value === "hard" || value.includes("难")) return "Hard";
  return "Medium";
};
const difficultyStyle: Record<string, string> = {
  Easy: "bg-emerald-50 text-emerald-800",
  Medium: "bg-amber-50 text-amber-800",
  Hard: "bg-rose-50 text-rose-800",
};

export default async function ProfilePage() {
  const session = await getCurrentUser();
  if (!session) redirect("/login");

  // Keep these queries sequential. The profile page is commonly opened right
  // after authentication, and issuing several remote database requests at once
  // can exhaust a small connection pool and make the entire page fail.
  const user = await retryAsync(() => prisma.user.findUnique({
      where: { id: session.id },
      include: {
        billingSubscriptions: { orderBy: { updatedAt: "desc" }, take: 1 },
        progress: {
          orderBy: { updatedAt: "desc" },
          include: { problem: { select: { id: true, slug: true, title: true, company: true, difficulty: true, category: true } } },
        },
        favorites: {
          orderBy: { createdAt: "desc" },
          include: { problem: { select: { id: true, slug: true, title: true, company: true, difficulty: true, category: true } } },
        },
      },
    }), { attempts: 3, delayMs: 350 });
  if (!user) redirect("/login");

  const allProblems = await retryAsync(() => prisma.problem.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, slug: true, title: true, company: true, difficulty: true, category: true },
    }), { attempts: 3, delayMs: 350 }).catch(() => []);
  const totalPosts = await retryAsync(() => prisma.post.count(), { attempts: 3, delayMs: 350 }).catch(() => 0);

  const isEmailAdmin = ADMIN_EMAILS.includes(user.email.toLowerCase().trim());
  const isAdmin = user.role === "ADMIN" || isEmailAdmin;
  if (isEmailAdmin && user.role !== "ADMIN") {
    await retryAsync(() => prisma.user.update({ where: { id: user.id }, data: { role: "ADMIN" } }), { attempts: 3, delayMs: 350 });
    user.role = "ADMIN";
  }

  const solvedProgress = user.progress.filter((item) => ["SOLVED", "COMPLETED"].includes(item.status.toUpperCase()));
  const solvedIds = new Set(solvedProgress.map((item) => item.problemId));
  const completionPercent = allProblems.length ? Math.round((solvedProgress.length / allProblems.length) * 100) : 0;
  const solvedByDifficulty = {
    Easy: solvedProgress.filter((item) => difficultyName(item.problem.difficulty) === "Easy").length,
    Medium: solvedProgress.filter((item) => difficultyName(item.problem.difficulty) === "Medium").length,
    Hard: solvedProgress.filter((item) => difficultyName(item.problem.difficulty) === "Hard").length,
  };
  const nextProblem = allProblems.find((problem) => !solvedIds.has(problem.id) && difficultyName(problem.difficulty) === "Medium")
    || allProblems.find((problem) => !solvedIds.has(problem.id));
  const recentPractice = user.progress.slice(0, 4);
  const savedQuestions = user.favorites.slice(0, 4);
  const latestSubscription = user.billingSubscriptions[0];
  const memberSince = new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "long" }).format(user.createdAt);
  const proExpiry = user.proExpiresAt && user.proExpiresAt.getTime() > Date.now()
    ? new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "short", day: "numeric" }).format(user.proExpiresAt)
    : null;

  return (
    <main className="min-h-screen bg-[#f4f6f9] px-4 py-8 text-slate-950 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-[1200px] space-y-5">
        <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">EchoINTV learning workspace</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-[28px]">学习 Dashboard</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">查看真实练习进度、继续上次学习，并管理收藏与会员状态。</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {isAdmin && <Link href="/admin" className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"><Shield className="h-4 w-4" />管理后台</Link>}
            <Link href="/problem" className="inline-flex h-10 items-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2">进入题库<ArrowRight className="h-4 w-4" /></Link>
          </div>
        </header>

        <section aria-labelledby="learning-progress-title" className="grid gap-5 lg:grid-cols-12">
          <div className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6 lg:col-span-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div><h2 id="learning-progress-title" className="text-base font-semibold">学习进度</h2><p className="mt-1 text-sm text-slate-600">已完成 {solvedProgress.length} / {allProblems.length} 道题</p></div>
              <div className="text-right"><div className="text-3xl font-medium tabular-nums">{completionPercent}%</div><div className="mt-1 text-xs text-slate-600">题库完成度</div></div>
            </div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100" aria-label={`题库完成度 ${completionPercent}%`}><div className="h-full rounded-full bg-blue-600" style={{ width: `${completionPercent}%` }} /></div>
            <div className="mt-6 grid grid-cols-3 divide-x divide-slate-200 border-t border-slate-100 pt-5">
              {(["Easy", "Medium", "Hard"] as const).map((level) => <div key={level} className="px-3 first:pl-0 last:pr-0"><div className="text-xs text-slate-600">{level}</div><div className="mt-1 text-xl font-medium tabular-nums">{solvedByDifficulty[level]}</div><div className="mt-1 text-xs text-slate-500">已完成</div></div>)}
            </div>
          </div>

          <div className="flex flex-col rounded-lg border border-slate-200 bg-white p-5 sm:p-6 lg:col-span-4">
            <div className="flex items-center gap-2 text-slate-700"><Target className="h-4 w-4" /><h2 className="text-base font-semibold text-slate-950">下一步学习</h2></div>
            {nextProblem ? <>
              <p className="mt-5 text-xs font-medium text-slate-600">推荐未完成题目</p>
              <h3 className="mt-2 text-lg font-semibold leading-6">{nextProblem.title}</h3>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600"><span>{nextProblem.company}</span><span aria-hidden="true">·</span><span>{nextProblem.category}</span><span className={`rounded-full px-2 py-1 font-medium ${difficultyStyle[difficultyName(nextProblem.difficulty)]}`}>{difficultyName(nextProblem.difficulty)}</span></div>
              <Link href={`/problem/${nextProblem.slug}`} className="mt-auto inline-flex min-h-11 items-center justify-between border-t border-slate-100 pt-4 text-sm font-semibold text-slate-950 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">开始这道题<ArrowRight className="h-4 w-4" /></Link>
            </> : <div className="mt-5 flex flex-1 flex-col justify-between"><p className="text-sm leading-6 text-slate-600">你已经完成了当前题库中的全部题目。</p><Link href="/blog" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-950 hover:text-blue-700">阅读面试经验<ArrowRight className="h-4 w-4" /></Link></div>}
          </div>
        </section>

        <section className="grid items-start gap-5 lg:grid-cols-12">
          <DashboardList title="最近练习" icon={<CheckCircle2 className="h-4 w-4 text-slate-500" />} action={<Link href="/problem" className="text-sm font-medium text-slate-600 hover:text-blue-700">查看题库</Link>} className="lg:col-span-7">
            {recentPractice.length ? recentPractice.map((item) => <Link key={item.id} href={`/problem/${item.problem.slug}`} className="group flex min-h-[68px] items-center gap-4 border-b border-slate-100 px-5 py-3 last:border-b-0 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600 sm:px-6"><div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold group-hover:text-blue-700">{item.problem.title}</div><div className="mt-1 truncate text-xs text-slate-600">{item.problem.company} · {item.problem.category}</div></div><div className="shrink-0 text-right"><div className="text-xs font-medium text-emerald-800">已完成</div><div className="mt-1 text-xs tabular-nums text-slate-500">{new Intl.DateTimeFormat("zh-CN", { month: "short", day: "numeric" }).format(item.updatedAt)}</div></div></Link>) : <EmptyList text="还没有练习记录。完成第一道题后，它会出现在这里。" link="/problem" action="选择第一道题" />}
          </DashboardList>

          <DashboardList title="收藏题目" icon={<Bookmark className="h-4 w-4 text-slate-500" />} action={<span className="text-sm tabular-nums text-slate-600">{user.favorites.length} 道</span>} className="lg:col-span-5">
            {savedQuestions.length ? savedQuestions.map((item) => <Link key={item.id} href={`/problem/${item.problem.slug}`} className="group flex min-h-[68px] items-center gap-3 border-b border-slate-100 px-5 py-3 last:border-b-0 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600 sm:px-6"><div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold group-hover:text-blue-700">{item.problem.title}</div><div className="mt-1 truncate text-xs text-slate-600">{item.problem.company} · {difficultyName(item.problem.difficulty)}</div></div><ArrowRight className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-blue-700" /></Link>) : <EmptyList text="你还没有收藏题目。收藏后可以从这里快速返回。" link="/problem" action="浏览题库" />}
          </DashboardList>
        </section>

        <section className="grid gap-5 lg:grid-cols-12">
          <div className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6 lg:col-span-7">
            <div className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-slate-500" /><h2 className="text-base font-semibold">学习资源</h2></div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <ResourceLink href="/problem" value={allProblems.length} title="面试真题" description="按公司、难度和题型继续练习。" />
              <ResourceLink href="/blog" value={totalPosts} title="面试经验" description="阅读真实流程、BQ 和技术复盘。" />
            </div>
          </div>

          <aside className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6 lg:col-span-5">
            <div className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white">{(user.name || user.email)[0].toUpperCase()}</div><div className="min-w-0"><h2 className="truncate text-base font-semibold">{user.name || user.email.split("@")[0]}</h2><p className="mt-1 truncate text-sm text-slate-600">{user.email}</p></div></div>
            <dl className="mt-5 space-y-3 border-t border-slate-100 pt-4 text-sm">
              <div className="flex items-center justify-between gap-4"><dt className="flex items-center gap-2 text-slate-600"><CalendarDays className="h-4 w-4" />加入时间</dt><dd className="text-right font-medium">{memberSince}</dd></div>
              <div className="flex items-center justify-between gap-4"><dt className="flex items-center gap-2 text-slate-600"><Code2 className="h-4 w-4" />账户等级</dt><dd className="text-right font-medium">{isAdmin ? "管理员 · Pro" : user.role === "PRO" ? "EchoINTV Pro" : "免费用户"}</dd></div>
              {proExpiry && <div className="flex items-center justify-between gap-4"><dt className="text-slate-600">Pro 有效期</dt><dd className="text-right font-medium tabular-nums">{proExpiry}</dd></div>}
            </dl>
            {!isAdmin && user.role !== "PRO" && <Link href="/pricing" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-950 hover:text-blue-700">查看会员方案<ArrowRight className="h-4 w-4" /></Link>}
          </aside>
        </section>

        {latestSubscription && <SubscriptionManager subscription={{ provider: latestSubscription.provider, status: latestSubscription.status, currentPeriodEnd: latestSubscription.currentPeriodEnd, cancelAtPeriodEnd: latestSubscription.cancelAtPeriodEnd }} />}
      </div>
    </main>
  );
}

function DashboardList({ title, icon, action, className, children }: { title: string; icon: React.ReactNode; action: React.ReactNode; className: string; children: React.ReactNode }) {
  return <div className={`rounded-lg border border-slate-200 bg-white ${className}`}><div className="flex items-center justify-between px-5 py-4 sm:px-6"><div className="flex items-center gap-2">{icon}<h2 className="text-base font-semibold">{title}</h2></div>{action}</div><div className="border-t border-slate-100">{children}</div></div>;
}
function EmptyList({ text, link, action }: { text: string; link: string; action: string }) {
  return <div className="px-5 py-8 sm:px-6"><p className="text-sm text-slate-600">{text}</p><Link href={link} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-950 hover:text-blue-700">{action}<ArrowRight className="h-4 w-4" /></Link></div>;
}
function ResourceLink({ href, value, title, description }: { href: string; value: number; title: string; description: string }) {
  return <Link href={href} className="group border-t border-slate-200 pt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"><div className="text-2xl font-medium tabular-nums">{value}</div><div className="mt-1 text-sm font-semibold group-hover:text-blue-700">{title}</div><p className="mt-2 text-sm leading-6 text-slate-600">{description}</p></Link>;
}

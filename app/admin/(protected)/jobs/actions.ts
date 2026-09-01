// app/admin/(protected)/jobs/actions.ts

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";

const ADMIN_EMAILS = ["admin@echointv.com", "shihaoy74@gmail.com"];

const GREENHOUSE_BOARDS = [
  { company: "OpenAI", board: "openai", defaultSalary: "$200,000 - $330,000 / yr" },
  { company: "Anthropic", board: "anthropic", defaultSalary: "$190,000 - $290,000 / yr" },
  { company: "Stripe", board: "stripe", defaultSalary: "$165,000 - $235,000 / yr" },
  { company: "Figma", board: "figma", defaultSalary: "$160,000 - $220,000 / yr" },
  { company: "Databricks", board: "databricks", defaultSalary: "$165,000 - $230,000 / yr" },
  { company: "Uber", board: "uber", defaultSalary: "$155,000 - $215,000 / yr" },
  { company: "Airbnb", board: "airbnb", defaultSalary: "$170,000 - $240,000 / yr" },
  { company: "Roblox", board: "roblox", defaultSalary: "$160,000 - $225,000 / yr" },
  { company: "Scale AI", board: "scaleai", defaultSalary: "$160,000 - $230,000 / yr" },
  { company: "Pinterest", board: "pinterest", defaultSalary: "$150,000 - $210,000 / yr" },
  { company: "Coinbase", board: "coinbase", defaultSalary: "$160,000 - $220,000 / yr" },
  { company: "Discord", board: "discord", defaultSalary: "$155,000 - $215,000 / yr" },
  { company: "Reddit", board: "reddit", defaultSalary: "$150,000 - $210,000 / yr" },
  { company: "Instacart", board: "instacart", defaultSalary: "$155,000 - $210,000 / yr" },
  { company: "DoorDash", board: "doordash", defaultSalary: "$155,000 - $215,000 / yr" },
  { company: "Palantir", board: "palantirtechnologies", defaultSalary: "$150,000 - $200,000 / yr" },
  { company: "Cloudflare", board: "cloudflare", defaultSalary: "$150,000 - $210,000 / yr" },
  { company: "Datadog", board: "datadog", defaultSalary: "$155,000 - $215,000 / yr" },
  { company: "Snowflake", board: "snowflake", defaultSalary: "$165,000 - $230,000 / yr" },
  { company: "Notion", board: "notion", defaultSalary: "$165,000 - $230,000 / yr" },
  { company: "Vercel", board: "vercel", defaultSalary: "$160,000 - $225,000 / yr" },
  { company: "Supabase", board: "supabase", defaultSalary: "$150,000 - $210,000 / yr" },
];

function isTechnicalJob(title: string): boolean {
  const t = title.toLowerCase();
  const isJunk = /\b(warehouse|store associate|cashier|retail|barista|driver|cleaner|nurse|forklift|culinary|chef|receptionist|security guard|operator|flight|sorter)\b/i.test(t);
  if (isJunk) return false;
  return /\b(engineer|developer|software|architect|data|machine learning|ml|ai|deep learning|scientist|researcher|cloud|devops|sre|security|frontend|backend|fullstack|full-stack|infrastructure|systems|qa|test|algorithm|quantitative|quant|robotics|firmware|hardware|mobile|platform)\b/i.test(t);
}

function determineTrack(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("ai") || t.includes("machine learning") || t.includes("ml") || t.includes("deep learning") || t.includes("algorithm")) return "AI/ML";
  if (t.includes("frontend") || t.includes("front end") || t.includes("web") || t.includes("react") || t.includes("ui")) return "Frontend";
  if (t.includes("data") || t.includes("analytics") || t.includes("statistic")) return "Data";
  if (t.includes("fullstack") || t.includes("full stack") || t.includes("full-stack")) return "Fullstack";
  return "Backend";
}

function determineType(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("intern") || t.includes("co-op") || t.includes("summer")) return "INTERN";
  if (t.includes("grad") || t.includes("university") || t.includes("campus") || t.includes("early career") || t.includes("2026") || t.includes("2027")) return "NEWGRAD";
  return "FULLTIME";
}

export async function syncJobsAction() {
  const session = await getCurrentUser();
  if (!session) throw new Error("请先登录管理员账号");

  const admin = await prisma.user.findUnique({ where: { id: session.id } });
  const isEmailAdmin = admin?.email && ADMIN_EMAILS.includes(admin.email.toLowerCase().trim());
  if (admin?.role !== "ADMIN" && !isEmailAdmin) throw new Error("无管理员操作权限");

  const jobModel = (prisma as any).job;
  if (!jobModel) throw new Error("数据库未初始化 Job 表");

  const existingJobs = await jobModel.findMany({ select: { applyUrl: true } });
  const existingUrlSet = new Set(existingJobs.map((j: any) => j.applyUrl));
  const toInsert: any[] = [];

  // 🌟 全量抓取 Greenhouse
  for (const target of GREENHOUSE_BOARDS) {
    try {
      const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${target.board}/jobs`);
      if (!res.ok) continue;
      const data = await res.json();

      for (const job of data.jobs || []) {
        if (!job.absolute_url || !job.title) continue;
        if (!isTechnicalJob(job.title)) continue;
        if (existingUrlSet.has(job.absolute_url)) continue;

        const loc = job.location?.name || "San Francisco, CA / Remote";
        toInsert.push({
          title: job.title,
          company: target.company,
          location: loc,
          region: loc.toLowerCase().includes("remote") ? "REMOTE" : "NA",
          type: determineType(job.title),
          track: determineTrack(job.title),
          salary: target.defaultSalary,
          applyUrl: job.absolute_url,
          tags: [target.company, "前沿独角兽", "Sponsor H1B", "高薪在招"],
          isHot: true,
          deadline: "🔥 开放投递中",
        });

        existingUrlSet.add(job.absolute_url);
      }
    } catch (e) {}
  }

  // 批量高速入库
  if (toInsert.length > 0) {
    for (let i = 0; i < toInsert.length; i += 100) {
      await jobModel.createMany({
        data: toInsert.slice(i, i + 100),
        skipDuplicates: true,
      });
    }
  }

  revalidatePath("/jobs");
  revalidatePath("/admin/jobs");

  return { success: true, count: toInsert.length };
}

export async function deleteJobAction(jobId: number) {
  const session = await getCurrentUser();
  if (!session) throw new Error("未登录");

  const admin = await prisma.user.findUnique({ where: { id: session.id } });
  const isEmailAdmin = admin?.email && ADMIN_EMAILS.includes(admin.email.toLowerCase().trim());
  if (admin?.role !== "ADMIN" && !isEmailAdmin) throw new Error("无操作权限");

  const jobModel = (prisma as any).job;
  await jobModel.delete({ where: { id: jobId } });

  revalidatePath("/jobs");
  revalidatePath("/admin/jobs");

  return { success: true };
}
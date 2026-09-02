// app/(public)/jobs/[company]/page.tsx

import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { ArrowLeft, CheckCircle2, BookOpen, Code2 } from "lucide-react";
import { COMPANY_CONFIGS } from "@/lib/jobs/company-config";
import { CompanyJobsClient, JobItem } from "@/components/CompanyJobsClient";
import { classifyJob } from "@/lib/jobs/normalizer";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ company: string }>;
}

// 辅助函数：根据路由参数安全查找匹配配置
function getTargetCompanyConfig(paramSlug: string) {
  const decoded = decodeURIComponent(paramSlug).toLowerCase().trim();
  return COMPANY_CONFIGS.find(
    (c) =>
      c.slug.toLowerCase() === decoded ||
      c.name.toLowerCase() === decoded
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { company } = await params;
  const config = getTargetCompanyConfig(company);
  const displayName = config ? config.name : decodeURIComponent(company).toUpperCase();

  return {
    title: `${displayName} 2026 在招求职岗位与官方投递直通 | Echo INTV`,
    description: `查看 ${displayName} 当前正在开放的 2026 校招 New Grad、暑期实习与社招岗位，支持 H1B 工签，官方直达投递。`,
  };
}

export default async function CompanyJobsPage({ params }: Props) {
  const { company } = await params;
  const config = getTargetCompanyConfig(company);

  // 1. 获取目标 slug 与展示名称
  const targetSlug = config ? config.slug : decodeURIComponent(company).toLowerCase();
  const displayCompanyName = config
    ? config.name
    : decodeURIComponent(company).toUpperCase();

  // 2. 根据 companySlug 过滤查询有效开放职位
  const jobs = await prisma.job.findMany({
    where: {
      isActive: true,
      companySlug: targetSlug,
    },
    select: {
      id: true,
      externalJobId: true,
      title: true,
      companyName: true,
      companySlug: true,
      location: true,
      isRemote: true,
      track: true,
      level: true,
      employmentType: true,
      applyUrl: true,
      salary: true,
      postedAt: true,
      updatedAt: true,
      ats: true,
    },
    orderBy: { postedAt: "desc" },
  });

  // 3. 字段标准化映射
  const displayJobs: JobItem[] = jobs.map((j) => {
    const classification = classifyJob(j.title, j.location, "");

    return {
      id: j.id,
      reqId: j.externalJobId,
      title: j.title,
      company: j.companyName || displayCompanyName,
      companySlug: j.companySlug,
      location: j.location,
      isRemote: j.isRemote,
      category: j.track,
      employmentType: j.employmentType || classification.jobType,
      applyUrl: j.applyUrl,
      salary: j.salary,
      postedAt: j.postedAt.toISOString(),
      updatedAt: j.updatedAt ? j.updatedAt.toISOString() : undefined,
      source: j.ats,
      region: classification.region,
      track: j.track || classification.track,
      jobType: (j.employmentType as any) || classification.jobType,
      level: j.level || classification.level,
      tags: classification.tags,
    };
  });

  // 4. 兼容性统计（对齐 "Intern" | "New Grad" | "Full-time" 类型）
  const internCount = displayJobs.filter(
    (j) =>
      j.jobType === "Intern" ||
      String(j.jobType).toUpperCase() === "INTERN" ||
      Boolean(j.track && j.track.toUpperCase().includes("INTERN"))
  ).length;

  const newGradCount = displayJobs.filter(
    (j) =>
      j.jobType === "New Grad" ||
      String(j.jobType).toUpperCase() === "NEWGRAD" ||
      Boolean(j.track && j.track.toUpperCase().includes("NEWGRAD"))
  ).length;

  const fulltimeCount = displayJobs.filter(
    (j) =>
      j.jobType === "Full-time" ||
      String(j.jobType).toUpperCase() === "FULLTIME" ||
      (!internCount && !newGradCount)
  ).length;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* 1. 顶部返回按钮 */}
        <div>
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-700 bg-slate-900 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-500 transition shadow-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>返回大厂招聘雷达总览</span>
          </Link>
        </div>

        {/* 2. 公司专属头部信息卡片 */}
        <div className="bg-slate-900/80 rounded-3xl p-8 border border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-3xl font-extrabold text-white">
                  {displayCompanyName}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>正在热招 ({displayJobs.length}个岗位)</span>
                </span>
              </div>

              {/* 彩色分类标签 */}
              <div className="flex flex-wrap items-center gap-2">
                {internCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-amber-950/60 text-amber-400 border border-amber-800">
                    <span>🏖️</span>
                    <span>2026暑期实习 ({internCount})</span>
                  </span>
                )}

                {newGradCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-purple-950/60 text-purple-400 border border-purple-800">
                    <span>🎓</span>
                    <span>2026校招 ({newGradCount})</span>
                  </span>
                )}

                {fulltimeCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-rose-950/60 text-rose-400 border border-rose-800">
                    <span>💼</span>
                    <span>大厂在招 ({fulltimeCount})</span>
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-400">
                官方招聘直通 · 支持 Sponsor H1B 工签 · 2026/2027 批次开放中
              </p>
            </div>

            {/* 协同刷题与面经入口 */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <Link
                href={`/problem?company=${encodeURIComponent(displayCompanyName)}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-900/40 hover:bg-blue-900/60 text-blue-300 text-xs font-bold rounded-xl border border-blue-700/60 transition"
              >
                <Code2 className="h-3.5 w-3.5" />
                <span>做该大厂面试真题 ➔</span>
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-900/40 hover:bg-purple-900/60 text-purple-300 text-xs font-bold rounded-xl border border-purple-700/60 transition"
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>看求职面经 ➔</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 3. 该公司的专属岗位列表 */}
        <section>
          <CompanyJobsClient
            initialJobs={displayJobs}
            companyStats={[{ slug: targetSlug, activeJobsCount: displayJobs.length }]}
          />
        </section>
      </div>
    </main>
  );
}
// app/(public)/jobs/[company]/page.tsx

import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { ArrowLeft, CheckCircle2, BookOpen, Code2 } from "lucide-react";
import { COMPANY_NAME_MAP, deduplicateJobList } from "../page";
import CompanyJobsClient from "@/components/CompanyJobsClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ company: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { company } = await params;
  const key = company.toLowerCase().trim();
  const info = COMPANY_NAME_MAP[key];
  const displayName = info ? info.display : decodeURIComponent(company).toUpperCase();

  return {
    title: `${displayName} 2026 在招求职岗位与官方投递直通 | Echo INTV`,
    description: `查看 ${displayName} 当前正在开放的 2026 校招 New Grad、暑期实习与社招岗位，支持 H1B 工签，官方直达投递。`,
  };
}

export default async function CompanyJobsPage({ params }: Props) {
  const { company } = await params;
  const key = company.toLowerCase().trim();
  const companyConfig = COMPANY_NAME_MAP[key];

  const targetAliases = companyConfig
    ? companyConfig.aliases
    : [decodeURIComponent(company).replace(/-/g, " ")];

  const displayCompanyName = companyConfig
    ? companyConfig.display
    : decodeURIComponent(company).toUpperCase();

  let rawJobs: any[] = [];
  try {
    const jobModel = (prisma as any).job;
    if (jobModel) {
      rawJobs = await jobModel.findMany({
        where: {
          OR: targetAliases.map((name) => ({
            company: {
              equals: name,
              mode: "insensitive",
            },
          })),
        },
        orderBy: { createdAt: "desc" },
      });
    }
  } catch (e) {}

  // 🌟 使用与主页完全相同的去重函数，确保两边数量 100% 相同！
  const displayJobs = deduplicateJobList(rawJobs);

  return (
    <main className="min-h-screen bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* 1. 顶部返回按钮 */}
        <div>
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:text-blue-600 hover:border-blue-200 transition shadow-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>返回大厂招聘雷达总览</span>
          </Link>
        </div>

        {/* 2. 公司专属头部信息卡片 */}
        <div className="bg-gray-50/70 rounded-3xl p-8 border border-gray-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-extrabold text-gray-900">
                  {displayCompanyName}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  <span>正在热招 ({displayJobs.length}个岗位)</span>
                </span>
              </div>
              <p className="text-xs text-gray-500">
                官方招聘直通 · 支持 Sponsor H1B 工签 · 2026/2027 批次开放中
              </p>
            </div>

            {/* 协同刷题与面经入口 */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <Link
                href={`/problem?company=${encodeURIComponent(displayCompanyName)}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 transition"
              >
                <Code2 className="h-3.5 w-3.5" />
                <span>做该大厂面试真题 ➔</span>
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-xl border border-purple-200 transition"
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>看求职面经 ➔</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 3. 该公司的专属岗位列表（带实习/校招/社招分类） */}
        <section>
          <CompanyJobsClient
            initialJobs={displayJobs}
            companyName={displayCompanyName}
          />
        </section>

      </div>
    </main>
  );
}
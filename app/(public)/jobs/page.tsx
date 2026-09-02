// app/(public)/jobs/page.tsx
import { prisma } from '@/lib/prisma';
import { CompanyJobsClient, JobItem } from '@/components/CompanyJobsClient';
import { classifyJob } from '@/lib/jobs/normalizer';
import { COMPANY_CONFIGS } from '@/lib/jobs/company-config';

export const revalidate = 60; // 1 分钟增量缓存更新

export const metadata = {
  title: '大厂招聘雷达 | EchoInterview Online',
  description: '全自动同步北美与全球头部科技企业官方 ATS 招聘数据，快人一步直达官方网申。',
};

export default async function JobsPage() {
  // 1. 查询所有有效开放职位 (对齐最新生效的字段: externalJobId, companyName, track, ats)
  const jobs = await prisma.job.findMany({
    where: { isActive: true },
    select: {
      id: true,
      externalJobId: true, // 对应 externalJobId
      title: true,
      companyName: true,   // 对应 companyName
      companySlug: true,
      location: true,
      isRemote: true,
      track: true,         // 对应 track
      level: true,
      employmentType: true,
      applyUrl: true,
      salary: true,
      postedAt: true,
      updatedAt: true,
      ats: true,           // 对应 ats
    },
    orderBy: { postedAt: 'desc' },
  });

  // 2. 字段序列化与向后兼容映射
  const allJobs: JobItem[] = [];

  for (const j of jobs) {
    const classification = classifyJob(j.title, j.location, '');

    let slug = (j.companySlug || '').toLowerCase().trim();
    if (!slug && j.companyName) {
      const compName = j.companyName;
      const matched = COMPANY_CONFIGS.find(
        (c) => String(c.name).toLowerCase() === String(compName).toLowerCase()
      );
      slug = matched ? matched.slug : String(compName).toLowerCase().replace(/[^a-z0-9]/g, '');
    }

    allJobs.push({
      id: j.id,
      reqId: j.externalJobId,
      title: j.title,
      company: j.companyName || 'Unknown Company',
      companySlug: slug,
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
    });
  }

  // 3. 统计各公司在招岗位数量
  const companyCountsMap = new Map<string, number>();
  for (const job of allJobs) {
    if (job.companySlug) {
      companyCountsMap.set(job.companySlug, (companyCountsMap.get(job.companySlug) || 0) + 1);
    }
  }

  const companyStats = Array.from(companyCountsMap.entries()).map(([slug, count]) => ({
    slug,
    activeJobsCount: count,
  }));

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
        <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
          大厂招聘雷达 <span className="text-indigo-400 font-mono text-xl ml-2">Job Radar</span>
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-400">
          全自动同步北美与全球头部科技企业官方 ATS 招聘数据，快人一步直达官方网申。
        </p>
      </div>

      <CompanyJobsClient
        initialJobs={allJobs}
        companyStats={companyStats}
      />
    </main>
  );
}
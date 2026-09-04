// app/(public)/jobs/page.tsx

import { prisma } from '@/lib/prisma';
import { CompanyJobsClient, JobItem } from '@/components/CompanyJobsClient';
import { classifyJob } from '@/lib/jobs/normalizer';
import { COMPANY_CONFIGS } from '@/lib/jobs/company-config';

export const revalidate = 60;

export const metadata = {
  title: '大厂招聘雷达 | EchoInterview Online',
  description:
    '全自动同步北美与全球头部科技企业官方 ATS 招聘数据，专注 New Grad 与 Intern 招聘机会。',
};

export default async function JobsPage() {
  /**
   * ============================================================
   * 1. 查询当前所有 active jobs
   *
   * 注意：
   * 数据库里面的社招岗位不要删除。
   * 我们这里只是在公共 Job Radar 页面过滤掉 Experienced。
   * ============================================================
   */
  const jobs = await prisma.job.findMany({
    where: {
      isActive: true,
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

      // 用于更加准确判断 NG / Intern
      department: true,
      description: true,

      applyUrl: true,
      salary: true,
      postedAt: true,
      updatedAt: true,
      ats: true,
    },

    orderBy: {
      postedAt: 'desc',
    },
  });

  /**
   * ============================================================
   * 2. 只保留 New Grad + Intern
   *
   * 核心逻辑：
   *
   * Intern
   *    -> 保留
   *
   * New Grad
   *    -> 保留
   *
   * Experienced
   *    -> 丢弃
   *
   * Full-time 本身不能直接代表社招，因为：
   *
   * New Grad = Full-time
   * Experienced = Full-time
   *
   * 所以必须使用 classifyJob() + level 判断。
   * ============================================================
   */
  const allJobs: JobItem[] = [];

  for (const j of jobs) {
    /**
     * 使用完整信息进行分类：
     *
     * title
     * location
     * description
     * department
     * employmentType
     */
    const classification = classifyJob(
      j.title,
      j.location,
      j.description || '',
      j.department || '',
      j.employmentType || undefined
    );

    const levelText = (j.level || '').toLowerCase().trim();
    const employmentText = (j.employmentType || '')
      .toLowerCase()
      .trim();

    /**
     * ------------------------------------------------------------
     * ATS 结构化 level 兼容
     *
     * 很多公司不会在 title 里写：
     *   New Grad
     *
     * 而是通过 level / job family 表示：
     *   Entry Level
     *   Early Career
     *   University
     *   Campus
     *   Graduate
     *   Junior
     *   Associate
     *
     * 这些信息不能丢，否则大量真正的 NG 会被当成 Experienced。
     * ------------------------------------------------------------
     */
    const levelLooksIntern =
      levelText.includes('intern') ||
      levelText.includes('internship') ||
      levelText.includes('co-op') ||
      levelText.includes('coop') ||
      levelText.includes('student') ||
      levelText.includes('trainee') ||
      levelText.includes('apprentice');

    const levelLooksNewGrad =
      levelText.includes('new grad') ||
      levelText.includes('new-grad') ||
      levelText.includes('new graduate') ||
      levelText.includes('early career') ||
      levelText.includes('early-career') ||
      levelText.includes('university') ||
      levelText.includes('campus') ||
      levelText.includes('graduate') ||
      levelText.includes('entry level') ||
      levelText.includes('entry-level') ||
      levelText.includes('entrylevel') ||
      levelText.includes('junior') ||
      levelText.includes('associate') ||
      levelText.includes('rotational') ||
      levelText.includes('sde i') ||
      levelText.includes('sde 1') ||
      levelText.includes('swe i') ||
      levelText.includes('swe 1');

    /**
     * ------------------------------------------------------------
     * 最终岗位类型
     *
     * 优先级：
     *
     * 1. ATS 结构化 level
     * 2. ATS employmentType
     * 3. normalizer / title / description 分类
     * ------------------------------------------------------------
     */
    let resolvedJobType: JobItem['jobType'];

    if (
      levelLooksIntern ||
      employmentText === 'intern' ||
      employmentText === 'internship' ||
      employmentText === 'co-op' ||
      employmentText === 'coop' ||
      classification.jobType === 'Intern'
    ) {
      resolvedJobType = 'Intern';
    } else if (
      levelLooksNewGrad ||
      j.level?.toLowerCase() === 'new grad' ||
      classification.jobType === 'New Grad'
    ) {
      resolvedJobType = 'New Grad';
    } else {
      /**
       * 其他全部认为是 Experienced / 社招。
       *
       * 这里直接 continue。
       *
       * 所以社招岗位根本不会进入 allJobs。
       */
      continue;
    }

    /**
     * ------------------------------------------------------------
     * 公司 slug 兼容处理
     * ------------------------------------------------------------
     */
    let slug = (j.companySlug || '').toLowerCase().trim();

    if (!slug && j.companyName) {
      const compName = j.companyName;

      const matched = COMPANY_CONFIGS.find(
        (c) =>
          String(c.name).toLowerCase() === String(compName).toLowerCase()
      );

      slug = matched
        ? matched.slug
        : String(compName)
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '');
    }

    /**
     * ------------------------------------------------------------
     * 加入最终公开岗位列表
     * ------------------------------------------------------------
     */
    allJobs.push({
      id: j.id,

      reqId: j.externalJobId,

      title: j.title,

      company: j.companyName || 'Unknown Company',

      companySlug: slug,

      location: j.location,

      isRemote: j.isRemote,

      category: j.track,

      /**
       * 这里不要再使用数据库里的 Full-time。
       *
       * 因为：
       *
       * NG 也可能是 Full-time。
       */
      employmentType: resolvedJobType,

      applyUrl: j.applyUrl,

      salary: j.salary,

      postedAt: j.postedAt.toISOString(),

      updatedAt: j.updatedAt
        ? j.updatedAt.toISOString()
        : undefined,

      source: j.ats,

      region: classification.region,

      track: j.track || classification.track,

      jobType: resolvedJobType,

      /**
       * Intern:
       *   level = Intern
       *
       * New Grad:
       *   level = New Grad
       */
      level:
        resolvedJobType === 'Intern'
          ? 'Intern'
          : 'New Grad',

      tags: classification.tags,
    });
  }

  /**
   * ============================================================
   * 3. 统计公司岗位数量
   *
   * 注意：
   * 此时 allJobs 已经只有：
   *
   *     New Grad
   *     Intern
   *
   * 所以这里统计出来的数量也不会再包含社招。
   * ============================================================
   */
  const companyCountsMap = new Map<string, number>();

  for (const job of allJobs) {
    if (!job.companySlug) continue;

    companyCountsMap.set(
      job.companySlug,
      (companyCountsMap.get(job.companySlug) || 0) + 1
    );
  }

  const companyStats = Array.from(
    companyCountsMap.entries()
  ).map(([slug, count]) => ({
    slug,
    activeJobsCount: count,
  }));

  /**
   * ============================================================
   * 4. 页面
   * ============================================================
   */
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
        <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
          大厂招聘雷达
          <span className="text-indigo-400 font-mono text-xl ml-2">
            Job Radar
          </span>
        </h1>

        <p className="mt-2 text-sm sm:text-base text-slate-400">
          聚合全球头部科技公司官方 ATS 招聘数据，专注 New Grad
          校招与 Intern 实习机会。
        </p>
      </div>

      <CompanyJobsClient
        initialJobs={allJobs}
        companyStats={companyStats}
      />
    </main>
  );
}
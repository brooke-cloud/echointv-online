// lib/jobs/sync.ts
import { prisma } from '@/lib/prisma';
import { CompanyConfig, getActiveCompanyConfigs } from './company-config';
import { fetchJobsByAts, NormalizedJob } from './adapters';

export interface CompanySyncResult {
  company: string;
  slug: string;
  ats: string;
  status: 'SUCCESS' | 'FAILED' | 'SKIPPED';
  fetchedCount: number;
  newCount: number;
  updatedCount: number;
  unchangedCount: number;
  closedCount: number;
  error?: string;
  durationMs: number;
}

export interface SyncResult {
  success: boolean;
  totalCompanies: number;
  succeededCompanies: number;
  failedCompanies: number;
  totalFetched: number;
  totalNew: number;
  totalUpdated: number;
  totalUnchanged: number;
  totalClosed: number;
  totalDurationMs: number;
  details: CompanySyncResult[];
}

function hasJobChanged(existing: any, incoming: NormalizedJob): boolean {
  return (
    existing.title !== incoming.title ||
    existing.location !== incoming.location ||
    existing.isRemote !== incoming.isRemote ||
    existing.track !== (incoming.track || incoming.category) ||
    existing.applyUrl !== incoming.applyUrl ||
    (existing.employmentType || '') !== (incoming.employmentType || '') ||
    existing.isActive === false
  );
}

export async function syncCompany(company: CompanyConfig): Promise<CompanySyncResult> {
  const startTime = Date.now();

  if (!company.enabled) {
    return {
      company: company.name,
      slug: company.slug,
      ats: company.ats,
      status: 'SKIPPED',
      fetchedCount: 0,
      newCount: 0,
      updatedCount: 0,
      unchangedCount: 0,
      closedCount: 0,
      durationMs: 0,
    };
  }

  try {
    const fetchedJobs = await fetchJobsByAts(
      company.name,
      company.slug,
      company.ats,
      company.identifier
    );

    const incomingMap = new Map<string, NormalizedJob>();
    for (const job of fetchedJobs) {
      const jobId = job.externalJobId || job.reqId;
      if (jobId) {
        incomingMap.set(jobId, job);
      }
    }
    const incomingJobs = Array.from(incomingMap.values());
    const incomingIds = new Set(incomingJobs.map((j) => j.externalJobId || j.reqId));

    const existingJobs = await prisma.job.findMany({
      where: { companySlug: company.slug },
    });
    const existingJobsMap = new Map(
      existingJobs.filter((j) => j.reqId).map((j) => [j.reqId!, j])
    );

    const jobsToCreate: any[] = [];
    const jobsToUpdate: { id: string; data: any }[] = [];
    let unchangedCount = 0;
    const now = new Date();

    for (const incoming of incomingJobs) {
      const incomingId = incoming.externalJobId || incoming.reqId || '';
      const existing = existingJobsMap.get(incomingId);

      if (!existing) {
        jobsToCreate.push({
          reqId: incomingId,
          ats: incoming.ats || incoming.source || company.ats.toLowerCase(),
          companyName: incoming.companyName || incoming.company || company.name,
          companySlug: incoming.companySlug || company.slug,
          title: incoming.title,
          location: incoming.location,
          locations: incoming.locations || [incoming.location],
          isRemote: incoming.isRemote,
          department: incoming.department,
          team: incoming.team,
          employmentType: incoming.employmentType,
          track: incoming.track || incoming.category || 'Fullstack',
          level: incoming.level,
          salary: incoming.salary,
          description: incoming.description,
          jobUrl: incoming.jobUrl || incoming.applyUrl,
          applyUrl: incoming.applyUrl,
          postedAt: incoming.postedAt,
          firstSeenAt: now,
          lastSeenAt: now,
          isActive: true,
        });
      } else {
        if (hasJobChanged(existing, incoming)) {
          jobsToUpdate.push({
            id: existing.id,
            data: {
              title: incoming.title,
              location: incoming.location,
              locations: incoming.locations || [incoming.location],
              isRemote: incoming.isRemote,
              department: incoming.department,
              team: incoming.team,
              employmentType: incoming.employmentType,
              track: incoming.track || incoming.category || 'Fullstack',
              level: incoming.level,
              description: incoming.description,
              jobUrl: incoming.jobUrl || incoming.applyUrl,
              applyUrl: incoming.applyUrl,
              postedAt: incoming.postedAt,
              lastSeenAt: now,
              isActive: true,
              updatedAt: now,
            },
          });
        } else {
          unchangedCount++;
        }
      }
    }

    const newCount = jobsToCreate.length;
    if (newCount > 0) {
      await prisma.job.createMany({
        data: jobsToCreate,
        skipDuplicates: true,
      });
    }

    const updatedCount = jobsToUpdate.length;
    if (updatedCount > 0) {
      const CHUNK_SIZE = 25;
      for (let i = 0; i < jobsToUpdate.length; i += CHUNK_SIZE) {
        const chunk = jobsToUpdate.slice(i, i + CHUNK_SIZE);
        await Promise.all(
          chunk.map((item) =>
            prisma.job.update({
              where: { id: item.id },
              data: item.data,
            })
          )
        );
      }
    }

    let closedCount = 0;
    if (incomingJobs.length > 0) {
      const activeExisting = existingJobs.filter((j) => j.isActive && j.reqId);
      const jobsToClose = activeExisting.filter((j) => !incomingIds.has(j.reqId!));
      closedCount = jobsToClose.length;

      if (closedCount > 0) {
        await prisma.job.updateMany({
          where: { id: { in: jobsToClose.map((j) => j.id) } },
          data: {
            isActive: false,
            updatedAt: now,
          },
        });
      }
    }

    return {
      company: company.name,
      slug: company.slug,
      ats: company.ats,
      status: 'SUCCESS',
      fetchedCount: fetchedJobs.length,
      newCount,
      updatedCount,
      unchangedCount,
      closedCount,
      durationMs: Date.now() - startTime,
    };
  } catch (error: any) {
    return {
      company: company.name,
      slug: company.slug,
      ats: company.ats,
      status: 'FAILED',
      fetchedCount: 0,
      newCount: 0,
      updatedCount: 0,
      unchangedCount: 0,
      closedCount: 0,
      error: error?.message || 'Sync error',
      durationMs: Date.now() - startTime,
    };
  }
}

export async function syncAllCompanies(
  customConfigs?: CompanyConfig[]
): Promise<SyncResult> {
  const globalStartTime = Date.now();
  const targetConfigs = customConfigs || getActiveCompanyConfigs();

  const settleResults = await Promise.allSettled(
    targetConfigs.map((company) => syncCompany(company))
  );

  const details: CompanySyncResult[] = settleResults.map((res, index) => {
    if (res.status === 'fulfilled') {
      return res.value;
    }
    return {
      company: targetConfigs[index].name,
      slug: targetConfigs[index].slug,
      ats: targetConfigs[index].ats,
      status: 'FAILED',
      fetchedCount: 0,
      newCount: 0,
      updatedCount: 0,
      unchangedCount: 0,
      closedCount: 0,
      error: res.reason?.message || 'Sync rejected',
      durationMs: 0,
    };
  });

  const succeededCompanies = details.filter((d) => d.status === 'SUCCESS').length;
  const failedCompanies = details.filter((d) => d.status === 'FAILED').length;

  return {
    success: failedCompanies === 0,
    totalCompanies: targetConfigs.length,
    succeededCompanies,
    failedCompanies,
    totalFetched: details.reduce((acc, curr) => acc + curr.fetchedCount, 0),
    totalNew: details.reduce((acc, curr) => acc + curr.newCount, 0),
    totalUpdated: details.reduce((acc, curr) => acc + curr.updatedCount, 0),
    totalUnchanged: details.reduce((acc, curr) => acc + curr.unchangedCount, 0),
    totalClosed: details.reduce((acc, curr) => acc + curr.closedCount, 0),
    totalDurationMs: Date.now() - globalStartTime,
    details,
  };
}
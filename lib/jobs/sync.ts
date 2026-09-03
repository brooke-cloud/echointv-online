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

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
};

/* =========================================================================
   1. 规范化分类引擎
   ========================================================================= */

const EXCLUDE_TITLE_REGEX =
  /\b(senior|sr\.?|staff|principal|lead|head|manager|director|vp|architect|distinguished|expert|partner)\b|\b(sde|swe)\s*(ii|iii|iv|2|3|4)\b/i;

const INTERN_REGEX =
  /\b(intern|internship|co-?op|coop|trainee|apprentice|fellowship|summer\s*associate|实习|实习生)\b/i;

const NEW_GRAD_REGEX =
  /\b(new\s*grad(uate)?|university\s*grad(uate)?|college\s*grad(uate)?|campus(\s*hire)?|early\s*career|entry\s*level|entry-level|fresh\s*grad(uate)?|graduate\s*program|rotational|sde\s*i\b|swe\s*i\b|software\s*engineer\s*i\b|associate\s*engineer|junior|校招|应届(生)?|校园招聘|202[4-7]\s*(start|grad|class)|class\s*of\s*202[4-7]|bs\/ms)\b/i;

export function classifyJobLevel(title: string, description: string = '') {
  const cleanTitle = title.trim();

  if (INTERN_REGEX.test(cleanTitle)) {
    return { level: 'Intern', employmentType: 'Intern' };
  }

  if (EXCLUDE_TITLE_REGEX.test(cleanTitle)) {
    return { level: 'Experienced', employmentType: 'Full-time' };
  }

  if (NEW_GRAD_REGEX.test(cleanTitle)) {
    return { level: 'New Grad', employmentType: 'Full-time' };
  }

  const descPrefix = description.slice(0, 300);
  if (INTERN_REGEX.test(descPrefix)) {
    return { level: 'Intern', employmentType: 'Intern' };
  }
  if (NEW_GRAD_REGEX.test(descPrefix)) {
    return { level: 'New Grad', employmentType: 'Full-time' };
  }

  return { level: 'Experienced', employmentType: 'Full-time' };
}

function inferTrack(title: string): string {
  const t = title.toLowerCase();
  if (t.includes('frontend') || t.includes('front end') || t.includes('web')) return 'Frontend';
  if (t.includes('backend') || t.includes('back end') || t.includes('infra') || t.includes('cloud')) return 'Backend';
  if (t.includes('mobile') || t.includes('ios') || t.includes('android')) return 'Mobile';
  if (t.includes('data') || t.includes('ai') || t.includes('ml') || t.includes('machine learning') || t.includes('algorithm')) return 'Data / AI';
  if (t.includes('security')) return 'Security';
  if (t.includes('devops') || t.includes('sre')) return 'DevOps';
  return 'Fullstack';
}

function buildNormalizedJob(params: {
  id: string;
  title: string;
  company: CompanyConfig;
  location?: string;
  url: string;
  description?: string;
  postedAt?: Date;
  department?: string;
  isRemote?: boolean;
}): NormalizedJob {
  const track = inferTrack(params.title);
  const classification = classifyJobLevel(params.title, params.description || '');
  const loc = params.location || 'United States';

  return {
    reqId: String(params.id),
    company: params.company.name,
    category: track,
    source: 'custom',

    externalJobId: String(params.id),
    companyName: params.company.name,
    companySlug: params.company.slug,
    ats: 'custom',
    title: params.title,
    location: loc,
    locations: [loc],
    isRemote: params.isRemote ?? false,
    department: params.department || 'Engineering',
    team: params.department || 'Engineering',
    employmentType: classification.employmentType,
    track,
    level: classification.level,
    description: params.description || '',
    jobUrl: params.url,
    applyUrl: params.url,
    postedAt: params.postedAt || new Date(),
  } as NormalizedJob;
}

/* =========================================================================
   2. 大厂官网开放接口适配
   ========================================================================= */

async function fetchGoogleJobs(company: CompanyConfig): Promise<NormalizedJob[]> {
  const url =
    'https://careers.google.com/api/v3/search/?degree_levels=ASSOCIATE&degree_levels=BACHELORS&employment_types=FULL_TIME&employment_types=INTERN&j=Software%20Engineer&location=United%20States';
  const res = await fetch(url, { headers: BROWSER_HEADERS, signal: AbortSignal.timeout(10000) });
  if (!res.ok) return [];
  const data = await res.json();

  return (data.jobs || []).map((j: any) =>
    buildNormalizedJob({
      id: j.id,
      title: j.title,
      company,
      location: j.locations?.[0]?.display_name,
      url: j.apply_url || `https://careers.google.com/jobs/results/${j.id}`,
      description: j.summary,
      postedAt: j.created ? new Date(j.created) : undefined,
    })
  );
}

async function fetchAmazonJobs(company: CompanyConfig): Promise<NormalizedJob[]> {
  const url =
    'https://www.amazon.jobs/en/search.json?category[]=software-development&country[]=USA&result_type=jobs';
  const res = await fetch(url, { headers: BROWSER_HEADERS, signal: AbortSignal.timeout(10000) });
  if (!res.ok) return [];
  const data = await res.json();

  return (data.jobs || []).map((j: any) =>
    buildNormalizedJob({
      id: j.id_icims || j.id,
      title: j.title,
      company,
      location: j.location || j.city,
      url: `https://www.amazon.jobs${j.job_path}`,
      description: j.basic_qualifications || j.description,
      postedAt: j.posted_date ? new Date(j.posted_date) : undefined,
      isRemote: j.is_virtual || false,
    })
  );
}

async function fetchMicrosoftJobs(company: CompanyConfig): Promise<NormalizedJob[]> {
  const url =
    'https://gcsservices.careers.microsoft.com/search/api/v1/search?lc=United%20States&exp=Students%20and%20graduates&p=Software%20Engineering';
  const res = await fetch(url, { headers: BROWSER_HEADERS, signal: AbortSignal.timeout(10000) });
  if (!res.ok) return [];
  const data = await res.json();

  const jobs = data?.operationResult?.result?.jobs || [];
  return jobs.map((j: any) =>
    buildNormalizedJob({
      id: j.jobId,
      title: j.title,
      company,
      location: j.properties?.primaryLocation,
      url: `https://jobs.careers.microsoft.com/global/en/job/${j.jobId}`,
      description: j.properties?.description,
      postedAt: j.postingDate ? new Date(j.postingDate) : undefined,
      isRemote: j.properties?.workSiteFlexibility?.toLowerCase().includes('remote'),
    })
  );
}

async function fetchMetaJobs(company: CompanyConfig): Promise<NormalizedJob[]> {
  const url = 'https://www.metacareers.com/careers_proxy/graphql';
  const query = `
    query GetMetaJobs($input: JobSearchInput!) {
      job_search(input: $input) {
        jobs {
          id
          title
          locations
          url
          created_at
        }
      }
    }
  `;
  const res = await fetch(url, {
    method: 'POST',
    headers: { ...BROWSER_HEADERS, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      variables: {
        input: { q: 'University', divisions: ['Software Engineering'] },
      },
    }),
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) return [];
  const data = await res.json();
  const jobs = data?.data?.job_search?.jobs || [];

  return jobs.map((j: any) =>
    buildNormalizedJob({
      id: j.id,
      title: j.title,
      company,
      location: j.locations?.[0],
      url: j.url || `https://www.metacareers.com/v2/jobs/${j.id}/`,
      postedAt: j.created_at ? new Date(j.created_at) : undefined,
    })
  );
}

async function fetchByteDanceJobs(company: CompanyConfig): Promise<NormalizedJob[]> {
  const url =
    'https://careers.tiktok.com/api/v1/search/job/posts?keyword=graduate&limit=50&offset=0';
  const res = await fetch(url, { headers: BROWSER_HEADERS, signal: AbortSignal.timeout(10000) });
  if (!res.ok) return [];
  const data = await res.json();
  const list = data?.data?.job_post_list || [];

  return list.map((j: any) =>
    buildNormalizedJob({
      id: j.id,
      title: j.title,
      company,
      location: j.city_info?.name,
      url: `https://careers.tiktok.com/position/${j.id}/detail`,
      description: j.description,
      postedAt: j.publish_time ? new Date(j.publish_time) : undefined,
    })
  );
}

async function fetchNvidiaJobs(company: CompanyConfig): Promise<NormalizedJob[]> {
  const url =
    'https://nvidia.wd5.myworkdayjobs.com/wday/cxs/nvidia/NVIDIAExternalCareerSite/jobs';
  const res = await fetch(url, {
    method: 'POST',
    headers: { ...BROWSER_HEADERS, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      appliedFacets: {},
      limit: 30,
      offset: 0,
      searchText: 'University',
    }),
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) return [];
  const data = await res.json();
  const list = data?.jobPostings || [];

  return list.map((j: any) =>
    buildNormalizedJob({
      id: j.bulletFields?.[0] || String(j.externalPath),
      title: j.title,
      company,
      location: j.locationsText || 'Santa Clara, CA',
      url: `https://nvidia.wd5.myworkdayjobs.com/en-US/NVIDIAExternalCareerSite${j.externalPath}`,
    })
  );
}

async function fetchTeslaJobs(company: CompanyConfig): Promise<NormalizedJob[]> {
  const url = 'https://www.tesla.com/cua-api/apps/careers/state';
  const res = await fetch(url, { headers: BROWSER_HEADERS, signal: AbortSignal.timeout(10000) });
  if (!res.ok) return [];
  const data = await res.json();
  const list = data?.listings || [];

  return list.slice(0, 40).map((j: any) =>
    buildNormalizedJob({
      id: j.id,
      title: j.t,
      company,
      location: j.l,
      url: `https://www.tesla.com/careers/search/job/${j.id}`,
    })
  );
}

async function fetchAppleJobs(company: CompanyConfig): Promise<NormalizedJob[]> {
  const url = 'https://jobs.apple.com/api/v1/jobDetails/search';
  const res = await fetch(url, {
    method: 'POST',
    headers: { ...BROWSER_HEADERS, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: 'intern software',
      filters: { range: { standardWeeklyHours: { start: null, end: null } } },
      page: 1,
      locale: 'en-us',
      sort: 'relevance',
    }),
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) return [];
  const data = await res.json();
  const list = data?.searchResults || [];

  return list.map((j: any) =>
    buildNormalizedJob({
      id: j.id,
      title: j.postingTitle,
      company,
      location: j.locations?.[0]?.name,
      url: `https://jobs.apple.com/en-us/details/${j.id}`,
      postedAt: j.postDateInGMT ? new Date(j.postDateInGMT) : undefined,
    })
  );
}

async function fetchCustomJobs(company: CompanyConfig): Promise<NormalizedJob[]> {
  const slug = (company.slug || '').toLowerCase();
  const name = (company.name || '').toLowerCase();

  try {
    if (slug.includes('google') || name.includes('google')) return await fetchGoogleJobs(company);
    if (slug.includes('amazon') || name.includes('amazon')) return await fetchAmazonJobs(company);
    if (slug.includes('microsoft') || name.includes('microsoft')) return await fetchMicrosoftJobs(company);
    if (slug.includes('meta') || name.includes('meta') || name.includes('facebook')) return await fetchMetaJobs(company);
    if (slug.includes('bytedance') || slug.includes('tiktok') || name.includes('tiktok')) return await fetchByteDanceJobs(company);
    if (slug.includes('nvidia') || name.includes('nvidia')) return await fetchNvidiaJobs(company);
    if (slug.includes('tesla') || name.includes('tesla')) return await fetchTeslaJobs(company);
    if (slug.includes('apple') || name.includes('apple')) return await fetchAppleJobs(company);

    return await fetchJobsByAts(company.name, company.slug, company.ats, company.identifier);
  } catch (err: any) {
    console.warn(`[Sync] ${company.name} 抓取异常:`, err?.message || err);
    return [];
  }
}

/* =========================================================================
   3. 核心入库比对与更新
   ========================================================================= */

function hasJobChanged(existing: any, incoming: NormalizedJob): boolean {
  return (
    existing.title !== incoming.title ||
    existing.location !== incoming.location ||
    existing.isRemote !== incoming.isRemote ||
    existing.track !== (incoming.track || incoming.category) ||
    existing.applyUrl !== incoming.applyUrl ||
    (existing.employmentType || '') !== (incoming.employmentType || '') ||
    existing.level !== incoming.level ||
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
    let fetchedJobs: NormalizedJob[] = [];
    if (company.ats && company.ats.toUpperCase() === 'CUSTOM') {
      fetchedJobs = await fetchCustomJobs(company);
    } else {
      fetchedJobs = await fetchJobsByAts(
        company.name,
        company.slug,
        company.ats,
        company.identifier
      );
    }

    const incomingMap = new Map<string, NormalizedJob>();
    for (const job of fetchedJobs) {
      const jobId = job.externalJobId || job.reqId;
      if (!jobId) continue;

      const classification = classifyJobLevel(job.title, job.description || '');
      job.level = classification.level;
      job.employmentType = classification.employmentType;

      incomingMap.set(jobId, job);
    }

    const incomingJobs = Array.from(incomingMap.values());
    const incomingIds = new Set(incomingJobs.map((j) => j.externalJobId || j.reqId));

    const existingJobs = await prisma.job.findMany({
      where: { companySlug: company.slug },
    });
    const existingJobsMap = new Map(
      existingJobs.filter((j) => j.externalJobId).map((j) => [j.externalJobId!, j])
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
          externalJobId: incomingId,
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
      const activeExisting = existingJobs.filter((j) => j.isActive && j.externalJobId);
      const jobsToClose = activeExisting.filter((j) => !incomingIds.has(j.externalJobId!));
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
      fetchedCount: incomingJobs.length,
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
// lib/jobs/adapters/greenhouse.ts

import {
  AtsAdapter,
  AtsFetchResult,
  NormalizedJob,
} from './types';
import { classifyJobLevel } from '../classifier';

interface GreenhouseLocation {
  name?: string;
}

interface GreenhouseOffice {
  name?: string;
  location?: string;
}

interface GreenhouseDepartment {
  name?: string;
}

interface GreenhouseJob {
  id?: number | string;
  internal_job_id?: number | string | null;

  title?: string;

  absolute_url?: string;

  location?: GreenhouseLocation | null;

  locations?: GreenhouseLocation[];

  offices?: GreenhouseOffice[];

  departments?: GreenhouseDepartment[];

  updated_at?: string | null;

  first_published?: string | null;

  content?: string | null;

  requisition_id?: string | null;

  metadata?: unknown;
}

interface GreenhouseJobsResponse {
  jobs?: GreenhouseJob[];

  meta?: {
    total?: number;
    count?: number;
    page?: number;
    per_page?: number;
    next?: string | null;
    next_page?: number | null;
  };

  total?: number;
  count?: number;
  page?: number;
  per_page?: number;
  next?: string | null;
  next_page?: number | null;
}

const REQUEST_TIMEOUT_MS = 30_000;

function createResult(
  jobs: NormalizedJob[],
  status: AtsFetchResult['status'],
  sourceComplete: boolean,
  options: Partial<AtsFetchResult> = {}
): AtsFetchResult {
  return {
    jobs,
    status,
    sourceComplete,
    rawCount:
      options.rawCount ?? jobs.length,
    fetchedCount: jobs.length,
    paginated:
      options.paginated ?? false,
    nextCursor:
      options.nextCursor,
    hasMore:
      options.hasMore ?? false,
    error:
      options.error,
    fetchedAt:
      options.fetchedAt ?? new Date(),
  };
}

function isValidIdentifier(
  identifier: string
): boolean {
  return (
    typeof identifier === 'string' &&
    identifier.trim().length > 0 &&
    identifier.trim().length <= 200
  );
}

function isValidJob(
  job: GreenhouseJob
): boolean {
  const hasId =
    job.id !== undefined &&
    job.id !== null &&
    String(job.id).trim().length > 0;

  const hasTitle =
    typeof job.title === 'string' &&
    job.title.trim().length > 0;

  const hasUrl =
    typeof job.absolute_url === 'string' &&
    job.absolute_url.trim().length > 0;

  return hasId && hasTitle && hasUrl;
}

function normalizeLocations(
  job: GreenhouseJob
): string[] {
  const locations: string[] = [];

  if (job.location?.name) {
    locations.push(job.location.name);
  }

  if (Array.isArray(job.locations)) {
    for (const location of job.locations) {
      if (
        location &&
        typeof location.name === 'string' &&
        location.name.trim()
      ) {
        locations.push(location.name);
      }
    }
  }

  if (Array.isArray(job.offices)) {
    for (const office of job.offices) {
      if (!office) {
        continue;
      }

      if (
        typeof office.location === 'string' &&
        office.location.trim()
      ) {
        locations.push(office.location);
        continue;
      }

      if (
        typeof office.name === 'string' &&
        office.name.trim()
      ) {
        locations.push(office.name);
      }
    }
  }

  return Array.from(
    new Set(
      locations
        .map((location) => location.trim())
        .filter(Boolean)
    )
  );
}

function normalizeDepartment(
  job: GreenhouseJob
): string | undefined {
  if (!Array.isArray(job.departments)) {
    return undefined;
  }

  const departments = job.departments
    .map((department) =>
      typeof department?.name === 'string'
        ? department.name.trim()
        : ''
    )
    .filter(Boolean);

  if (departments.length === 0) {
    return undefined;
  }

  return departments.join(', ');
}

function normalizePostedAt(
  job: GreenhouseJob
): Date {
  const candidates = [
    job.first_published,
    job.updated_at,
  ];

  for (const value of candidates) {
    if (!value) {
      continue;
    }

    const parsed = new Date(value);

    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return new Date();
}

function detectRemote(
  locations: string[],
  title: string,
  description: string
): boolean {
  const text = [
    title,
    description,
    ...locations,
  ]
    .join(' ')
    .toLowerCase();

  return (
    /\bremote\b/.test(text) ||
    /\bwork\s+from\s+home\b/.test(text) ||
    /\bdistributed\b/.test(text)
  );
}

function getTrack(
  title: string,
  description: string,
  department?: string
): string {
  const text = [
    title,
    department || '',
    description,
  ]
    .join(' ')
    .toLowerCase();

  if (
    /\b(machine learning|ml|artificial intelligence|ai)\b/.test(
      text
    )
  ) {
    return 'AI/ML';
  }

  if (
    /\b(data scientist|data science|analytics)\b/.test(
      text
    )
  ) {
    return 'Data';
  }

  if (
    /\b(frontend|front-end|react|vue|angular|web)\b/.test(
      text
    )
  ) {
    return 'Frontend';
  }

  if (
    /\b(backend|back-end|api|distributed systems|platform)\b/.test(
      text
    )
  ) {
    return 'Backend';
  }

  if (
    /\b(mobile|ios|android|swift|kotlin)\b/.test(
      text
    )
  ) {
    return 'Mobile';
  }

  if (
    /\b(devops|sre|site reliability|infrastructure|cloud)\b/.test(
      text
    )
  ) {
    return 'Infrastructure';
  }

  return 'Fullstack';
}

function getEmploymentType(
  category: string
): string | undefined {
  if (category === 'INTERN') {
    return 'Intern';
  }

  if (category === 'NG') {
    return 'New Grad';
  }

  return undefined;
}

function normalizeJob(
  job: GreenhouseJob,
  companyName: string,
  companySlug: string
): NormalizedJob {
  const externalJobId =
    String(job.id);

  const title =
    job.title?.trim() ||
    'Untitled Position';

  const jobUrl =
    job.absolute_url?.trim() ||
    '';

  const locations =
    normalizeLocations(job);

  const location =
    locations[0] ||
    'US';

  const department =
    normalizeDepartment(job);

  const description =
    typeof job.content === 'string'
      ? job.content
      : '';

  /*
   * 使用项目现有 classifier.ts。
   *
   * 不再调用不存在的 classifyJob()。
   */
  const classification =
    classifyJobLevel(
      title,
      description
    );

  const isRemote =
    detectRemote(
      locations,
      title,
      description
    );

  const track =
    getTrack(
      title,
      description,
      department
    );

  const employmentType =
    getEmploymentType(
      classification.category
    );

  const postedAt =
    normalizePostedAt(job);

  return {
    reqId:
      job.requisition_id?.trim() ||
      externalJobId,

    externalJobId,

    company:
      companyName,

    companyName:
      companyName,

    companySlug:
      companySlug,

    title,

    location,

    locations,

    isRemote,

    department,

    team:
      undefined,

    employmentType,

    category:
      classification.category,

    track,

    level:
      classification.level,

    salary:
      undefined,

    description,

    jobUrl,

    /*
     * Greenhouse absolute_url 是官方公开职位页面。
     */
    applyUrl:
      `${jobUrl}#app`,

    postedAt,

    source:
      'greenhouse',

    ats:
      'greenhouse',
  };
}

export class GreenhouseAdapter
  implements AtsAdapter
{
  /**
   * 兼容旧调用方式。
   */
  async fetchJobs(
    companyName: string,
    companySlug: string,
    identifier: string
  ): Promise<NormalizedJob[]> {
    const result =
      await this.fetchJobsDetailed(
        companyName,
        companySlug,
        identifier
      );

    return result.jobs;
  }

  /**
   * 新的详细 ATS 数据抓取接口。
   */
  async fetchJobsDetailed(
    companyName: string,
    companySlug: string,
    identifier: string
  ): Promise<AtsFetchResult> {
    const startedAt =
      new Date();

    if (
      !isValidIdentifier(identifier)
    ) {
      return createResult(
        [],
        'FAILED',
        false,
        {
          error:
            'Invalid Greenhouse board identifier.',

          fetchedAt:
            startedAt,
        }
      );
    }

    const boardToken =
      identifier.trim();

    const url =
      `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(
        boardToken
      )}/jobs?content=true`;

    const controller =
      new AbortController();

    const timeout =
      setTimeout(
        () =>
          controller.abort(),
        REQUEST_TIMEOUT_MS
      );

    try {
      const response =
        await fetch(
          url,
          {
            method: 'GET',

            headers: {
              Accept:
                'application/json',

              'User-Agent':
                'EchoIntv Jobs Data Sync/1.0',
            },

            redirect:
              'follow',

            cache:
              'no-store',

            signal:
              controller.signal,
          }
        );

      if (!response.ok) {
        return createResult(
          [],
          'FAILED',
          false,
          {
            error:
              `Greenhouse API returned HTTP ${response.status}.`,

            fetchedAt:
              new Date(),
          }
        );
      }

      let payload: unknown;

      try {
        payload =
          await response.json();
      } catch {
        return createResult(
          [],
          'FAILED',
          false,
          {
            error:
              'Greenhouse API returned invalid JSON.',

            fetchedAt:
              new Date(),
          }
        );
      }

      if (
        !payload ||
        typeof payload !== 'object'
      ) {
        return createResult(
          [],
          'FAILED',
          false,
          {
            error:
              'Greenhouse API returned an invalid response object.',

            fetchedAt:
              new Date(),
          }
        );
      }

      const typedPayload =
        payload as GreenhouseJobsResponse;

      if (
        !Array.isArray(
          typedPayload.jobs
        )
      ) {
        return createResult(
          [],
          'FAILED',
          false,
          {
            error:
              'Greenhouse API response does not contain a jobs array.',

            fetchedAt:
              new Date(),
          }
        );
      }

      const rawJobs =
        typedPayload.jobs;

      const validJobs =
        rawJobs.filter(
          isValidJob
        );

      const invalidCount =
        rawJobs.length -
        validJobs.length;

      const normalizedJobs =
        validJobs.map(
          (job) =>
            normalizeJob(
              job,
              companyName,
              companySlug
            )
        );

      /*
       * 去重。
       *
       * externalJobId 是 Greenhouse 职位的稳定身份。
       */
      const uniqueJobs =
        Array.from(
          new Map(
            normalizedJobs.map(
              (job) => [
                job.externalJobId,
                job,
              ]
            )
          ).values()
        );

      /*
       * 检查响应是否暴露分页/下一页信息。
       */
      const explicitNext =
        typeof typedPayload.next ===
          'string' &&
        typedPayload.next.trim()
          ? typedPayload.next.trim()
          : typeof typedPayload.meta?.next ===
                'string' &&
              typedPayload.meta.next.trim()
            ? typedPayload.meta.next.trim()
            : undefined;

      const nextPage =
        typedPayload.next_page ??
        typedPayload.meta?.next_page;

      const reportedTotal =
        typeof typedPayload.total ===
          'number'
          ? typedPayload.total
          : typeof typedPayload.count ===
              'number'
            ? typedPayload.count
            : typeof typedPayload.meta?.total ===
                'number'
              ? typedPayload.meta.total
              : typeof typedPayload.meta?.count ===
                  'number'
                ? typedPayload.meta.count
                : undefined;

      /*
       * 明确存在下一页。
       */
      if (
        explicitNext ||
        typeof nextPage === 'number'
      ) {
        return createResult(
          uniqueJobs,
          'PARTIAL',
          false,
          {
            rawCount:
              rawJobs.length,

            paginated:
              true,

            hasMore:
              true,

            nextCursor:
              explicitNext ||
              String(nextPage),

            error:
              'Greenhouse source indicates additional data is available. The source cannot be treated as a complete snapshot yet.',

            fetchedAt:
              new Date(),
          }
        );
      }

      /*
       * 如果 API 明确告诉我们 total 大于当前返回数量，
       * 说明当前结果不完整。
       */
      if (
        typeof reportedTotal ===
          'number' &&
        reportedTotal >
          uniqueJobs.length
      ) {
        return createResult(
          uniqueJobs,
          'PARTIAL',
          false,
          {
            rawCount:
              rawJobs.length,

            paginated:
              true,

            hasMore:
              true,

            error:
              `Greenhouse reported ${reportedTotal} jobs but only ${uniqueJobs.length} valid unique jobs were returned.`,

            fetchedAt:
              new Date(),
          }
        );
      }

      /*
       * 如果返回了无法识别的职位记录，
       * 不能把整个 source 声明为完全准确。
       */
      if (
        invalidCount > 0
      ) {
        return createResult(
          uniqueJobs,
          'PARTIAL',
          false,
          {
            rawCount:
              rawJobs.length,

            paginated:
              false,

            hasMore:
              false,

            error:
              `Greenhouse returned ${invalidCount} malformed job record(s); source completeness cannot be guaranteed.`,

            fetchedAt:
              new Date(),
          }
        );
      }

      /*
       * 到这里：
       *
       * 1. HTTP 成功
       * 2. JSON 有效
       * 3. jobs 数组存在
       * 4. 每个职位有 ID / title / official URL
       * 5. 没有发现下一页
       *
       * 因此当前 Greenhouse board response 可以作为
       * 完整 source snapshot 使用。
       */
      return createResult(
        uniqueJobs,
        'COMPLETE',
        true,
        {
          rawCount:
            rawJobs.length,

          paginated:
            false,

          hasMore:
            false,

          fetchedAt:
            new Date(),
        }
      );
    } catch (error: any) {
      const isAbort =
        error?.name ===
        'AbortError';

      return createResult(
        [],
        'FAILED',
        false,
        {
          error:
            isAbort
              ? `Greenhouse API request timed out after ${REQUEST_TIMEOUT_MS}ms.`
              : error?.message ||
                'Greenhouse API request failed.',

          fetchedAt:
            new Date(),
        }
      );
    } finally {
      clearTimeout(
        timeout
      );
    }
  }
}
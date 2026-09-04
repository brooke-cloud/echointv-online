// lib/jobs/adapters/ashby.ts

import {
  AtsAdapter,
  AtsFetchResult,
  NormalizedJob,
} from './types';

import { classifyJobLevel } from '../classifier';


interface AshbySecondaryLocation {
  location?: string;

  locationName?: string;

  address?: {
    addressLocality?: string;
    addressRegion?: string;
    addressCountry?: string;
  };
}


interface AshbyRawJob {
  id?: string;

  title?: string;

  location?: string;

  locationName?: string;

  secondaryLocations?: AshbySecondaryLocation[];

  isListed?: boolean;

  isRemote?: boolean;

  workplaceType?: string;

  descriptionHtml?: string;

  descriptionPlain?: string;

  department?: string;

  departmentName?: string;

  team?: string;

  teamName?: string;

  employmentType?: string;

  publishedAt?: string;

  jobUrl?: string;

  applyUrl?: string;

  compensation?: {
    compensationTierSummary?: string;

    scrapeableCompensationSalarySummary?: string;

    compensationTiers?: Array<{
      id?: string;
      tierSummary?: string;
      title?: string;
    }>;

    summaryComponents?: Array<{
      compensationType?: string;
      interval?: string;
      currencyCode?: string;
      minValue?: number | null;
      maxValue?: number | null;
    }>;
  };
}


interface AshbyBoardResponse {
  apiVersion?: string;

  jobs?: AshbyRawJob[];
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

    fetchedCount:
      jobs.length,

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
  job: AshbyRawJob
): boolean {

  return Boolean(
    typeof job.id === 'string' &&
    job.id.trim() &&

    typeof job.title === 'string' &&
    job.title.trim() &&

    typeof job.jobUrl === 'string' &&
    job.jobUrl.trim()
  );

}


function normalizeLocations(
  job: AshbyRawJob
): string[] {

  const locations: string[] = [];


  const primary =
    job.locationName ||
    job.location;


  if (
    typeof primary === 'string' &&
    primary.trim()
  ) {

    locations.push(
      primary.trim()
    );

  }


  if (
    Array.isArray(
      job.secondaryLocations
    )
  ) {

    for (
      const secondary
      of job.secondaryLocations
    ) {

      if (!secondary) {
        continue;
      }


      const location =
        secondary.location ||
        secondary.locationName;


      if (
        typeof location === 'string' &&
        location.trim()
      ) {

        locations.push(
          location.trim()
        );

        continue;
      }


      const address =
        secondary.address;


      if (!address) {
        continue;
      }


      const parts = [
        address.addressLocality,
        address.addressRegion,
        address.addressCountry,
      ]
        .filter(
          (
            value
          ): value is string =>
            typeof value === 'string' &&
            value.trim().length > 0
        )
        .map(
          value =>
            value.trim()
        );


      if (parts.length > 0) {

        locations.push(
          parts.join(', ')
        );

      }

    }

  }


  return Array.from(
    new Set(
      locations
    )
  );

}


function normalizePostedAt(
  value?: string
): Date {

  if (!value) {
    return new Date();
  }


  const date =
    new Date(value);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return new Date();

  }


  return date;

}


function normalizeSalary(
  job: AshbyRawJob
): string | undefined {

  const compensation =
    job.compensation;


  if (!compensation) {
    return undefined;
  }


  if (
    typeof compensation
      .scrapeableCompensationSalarySummary ===
      'string' &&
    compensation
      .scrapeableCompensationSalarySummary
      .trim()
  ) {

    return compensation
      .scrapeableCompensationSalarySummary
      .trim();

  }


  if (
    typeof compensation
      .compensationTierSummary ===
      'string' &&
    compensation
      .compensationTierSummary
      .trim()
  ) {

    return compensation
      .compensationTierSummary
      .trim();

  }


  return undefined;

}


function detectRemote(
  job: AshbyRawJob,
  locations: string[],
  description: string
): boolean {

  if (
    job.isRemote === true
  ) {

    return true;

  }


  if (
    typeof job.workplaceType === 'string' &&
    /\bremote\b/i.test(
      job.workplaceType
    )
  ) {

    return true;

  }


  const text = [
    job.title || '',
    job.locationName || '',
    ...locations,
    description,
  ]
    .join(' ')
    .toLowerCase();


  return (
    /\bremote\b/.test(text) ||
    /\bwork\s+from\s+home\b/.test(text) ||
    /\bfully\s+remote\b/.test(text)
  );

}


function normalizeTrack(
  job: AshbyRawJob,
  classificationCategory: string
): string {

  const text = [
    job.title || '',
    job.department || '',
    job.departmentName || '',
    job.team || '',
    job.teamName || '',
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
    /\b(data scientist|data science|analytics|data engineer)\b/.test(
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
    /\b(backend|back-end|api|platform|distributed systems)\b/.test(
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


  if (
    classificationCategory === 'INTERN'
  ) {

    return 'Software';

  }


  return 'Software';

}


function normalizeEmploymentType(
  job: AshbyRawJob,
  category: string
): string | undefined {

  if (
    typeof job.employmentType === 'string' &&
    job.employmentType.trim()
  ) {

    return job.employmentType.trim();

  }


  if (
    category === 'INTERN'
  ) {

    return 'Intern';

  }


  if (
    category === 'NG'
  ) {

    return 'New Grad';

  }


  return undefined;

}


function normalizeJob(
  job: AshbyRawJob,
  companyName: string,
  companySlug: string
): NormalizedJob {

  const title =
    job.title!.trim();


  const description =
    typeof job.descriptionPlain === 'string'
      ? job.descriptionPlain.trim()
      : '';


  const locations =
    normalizeLocations(job);


  const location =
    locations[0] ||
    'US / Unspecified';


  const classification =
    classifyJobLevel(
      title,
      description
    );


  const jobUrl =
    job.jobUrl!.trim();


  const applyUrl =
    typeof job.applyUrl === 'string' &&
    job.applyUrl.trim()
      ? job.applyUrl.trim()
      : jobUrl;


  return {

    reqId:
      job.id!.trim(),

    externalJobId:
      job.id!.trim(),

    company:
      companyName,

    companyName,

    companySlug,

    title,

    location,

    locations,

    isRemote:
      detectRemote(
        job,
        locations,
        description
      ),

    department:
      job.departmentName ||
      job.department,

    team:
      job.teamName ||
      job.team,

    employmentType:
      normalizeEmploymentType(
        job,
        classification.category
      ),

    category:
      classification.category,

    track:
      normalizeTrack(
        job,
        classification.category
      ),

    level:
      classification.level,

    salary:
      normalizeSalary(job),

    description:
      description
        ? description.slice(0, 6000)
        : undefined,

    jobUrl,

    /*
     * 直接使用 Ashby 官方 API 返回的 applyUrl。
     */
    applyUrl,

    postedAt:
      normalizePostedAt(
        job.publishedAt
      ),

    source:
      'ashby',

    ats:
      'ashby',

  };

}


export class AshbyAdapter
  implements AtsAdapter {


  /**
   * 保留旧接口。
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
   * 新的数据质量接口。
   */
  async fetchJobsDetailed(
    companyName: string,
    companySlug: string,
    identifier: string
  ): Promise<AtsFetchResult> {

    const startedAt =
      new Date();


    if (
      !isValidIdentifier(
        identifier
      )
    ) {

      return createResult(
        [],
        'FAILED',
        false,
        {
          error:
            'Invalid Ashby job board identifier.',

          fetchedAt:
            startedAt,
        }
      );

    }


    const boardName =
      identifier.trim();


    /*
     * Ashby 官方 Public Job Postings API。
     *
     * 官方文档说明：
     * 该接口用于获取组织当前已发布的 Job Postings。
     */
    const url =
      `https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(
        boardName
      )}?includeCompensation=true`;


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
            method:
              'GET',

            headers: {
              Accept:
                'application/json',

              'User-Agent':
                'EchoIntv Jobs Sync/1.0',
            },

            redirect:
              'follow',

            cache:
              'no-store',

            signal:
              controller.signal,
          }
        );


      if (
        !response.ok
      ) {

        return createResult(
          [],
          'FAILED',
          false,
          {
            error:
              `Ashby API returned HTTP ${response.status}.`,

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
              'Ashby API returned invalid JSON.',

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
              'Ashby API returned an invalid response object.',

            fetchedAt:
              new Date(),
          }
        );

      }


      const data =
        payload as AshbyBoardResponse;


      if (
        !Array.isArray(
          data.jobs
        )
      ) {

        return createResult(
          [],
          'FAILED',
          false,
          {
            error:
              'Ashby API response does not contain a jobs array.',

            fetchedAt:
              new Date(),
          }
        );

      }


      const rawJobs =
        data.jobs;


      /*
       * Ashby public Job Board 可能包含
       * isListed=false 的职位。
       *
       * 这些职位可以通过 direct link 访问，
       * 但不应该出现在公开 Job Board 列表中。
       *
       * 所以这里保持官方 Job Board 的语义：
       * isListed=false -> 不进入公开职位集合。
       */
      const listedJobs =
        rawJobs.filter(
          job =>
            job.isListed !== false
        );


      const invalidJobs =
        listedJobs.filter(
          job =>
            !isValidJob(job)
        );


      const validJobs =
        listedJobs.filter(
          isValidJob
        );


      const normalizedJobs =
        validJobs.map(
          job =>
            normalizeJob(
              job,
              companyName,
              companySlug
            )
        );


      /*
       * 以 Ashby job id 去重。
       */
      const uniqueJobs =
        Array.from(
          new Map(
            normalizedJobs.map(
              job => [
                job.externalJobId,
                job,
              ]
            )
          ).values()
        );


      /*
       * 如果公开 Job Board 返回了 malformed records，
       * 不能声称数据 100% 完整。
       */
      if (
        invalidJobs.length > 0
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
              `Ashby returned ${invalidJobs.length} malformed listed job record(s).`,

            fetchedAt:
              new Date(),
          }
        );

      }


      /*
       * Ashby Public Job Postings API 本身返回当前
       * published Job Postings 集合，不使用 cursor
       * 分页模式。
       *
       * 因此不能像 Lever 一样因为数量达到 100
       * 就错误地判断为 PARTIAL。
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
              ? `Ashby API request timed out after ${REQUEST_TIMEOUT_MS}ms.`
              : error?.message ||
                'Ashby API request failed.',

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
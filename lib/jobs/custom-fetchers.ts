// lib/jobs/custom-fetchers.ts

import { NormalizedJob } from './adapters';

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128 Safari/537.36',
  Accept: 'application/json,text/plain,*/*',
  'Accept-Language': 'en-US,en;q=0.9',
};


function normalizeDate(value: unknown): Date {
  if (value instanceof Date) {
    return value;
  }

  if (
    typeof value === 'string' ||
    typeof value === 'number'
  ) {
    const date = new Date(value);

    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  return new Date();
}


function createNormalizedJob(
  company: any,
  data: {
    id: string;
    title: string;
    location?: string;
    description?: string;
    url: string;
    postedAt?: unknown;
  }
): NormalizedJob {

  return {
    reqId: data.id,

    externalJobId: data.id,

    company: company.name,

    companyName: company.name,

    companySlug: company.slug,


    title:
      data.title || '',


    location:
      data.location ||
      'United States',


    locations:
      data.location
        ? [data.location]
        : [],


    isRemote: false,


    department:
      'Engineering',


    team:
      'Engineering',


    employmentType:
      undefined,


    category:
      'Engineering',


    track:
      'Fullstack',


    level:
      undefined,


    description:
      data.description || '',


    jobUrl:
      data.url,


    applyUrl:
      data.url,


    postedAt:
      normalizeDate(
        data.postedAt
      ),


    source:
      'custom',


    ats:
      'custom',
  };
}


/**
 * Google
 */
export async function fetchGoogleJobs(
  company: any
): Promise<NormalizedJob[]> {

  const response = await fetch(
    'https://careers.google.com/api/v3/search/?j=Software%20Engineer&location=United%20States',
    {
      headers: BROWSER_HEADERS,
    }
  );


  if (!response.ok) {
    throw new Error(
      `Google API ${response.status}`
    );
  }


  const data = await response.json();


  return (data?.jobs || []).map(
    (job: any) =>
      createNormalizedJob(
        company,
        {
          id: String(job.id),

          title:
            job.title,

          location:
            job.locations?.[0]?.display_name,

          description:
            job.summary,

          url:
            job.apply_url ||
            `https://careers.google.com/jobs/results/${job.id}`,

          postedAt:
            job.created,
        }
      )
  );
}


/**
 * Amazon
 */
export async function fetchAmazonJobs(
  company: any
): Promise<NormalizedJob[]> {

  const response = await fetch(
    'https://www.amazon.jobs/en/search.json?category[]=software-development&country[]=USA',
    {
      headers: BROWSER_HEADERS,
    }
  );


  if (!response.ok) {
    throw new Error(
      `Amazon API ${response.status}`
    );
  }


  const data = await response.json();


  return (data?.jobs || []).map(
    (job: any) =>
      createNormalizedJob(
        company,
        {
          id: String(
            job.id_icims ||
            job.id
          ),

          title:
            job.title,

          location:
            job.location,

          description:
            job.description ||
            job.basic_qualifications,

          url:
            job.job_path
              ? `https://www.amazon.jobs${job.job_path}`
              : 'https://www.amazon.jobs',

          postedAt:
            job.posted_date,
        }
      )
  );
}

/**
 * Microsoft
 */
export async function fetchMicrosoftJobs(
  company: any
): Promise<NormalizedJob[]> {

  const response = await fetch(
    'https://gcsservices.careers.microsoft.com/search/api/v1/search?lc=United%20States&p=Software%20Engineering',
    {
      headers: BROWSER_HEADERS,
    }
  );


  if (!response.ok) {
    throw new Error(
      `Microsoft API ${response.status}`
    );
  }


  const data =
    await response.json();


  const jobs =
    data?.operationResult?.result?.jobs || [];


  return jobs.map(
    (job: any) =>
      createNormalizedJob(
        company,
        {
          id:
            String(job.jobId),

          title:
            job.title,

          location:
            job.properties
              ?.primaryLocation,

          description:
            job.properties
              ?.description,

          url:
            `https://jobs.careers.microsoft.com/global/en/job/${job.jobId}`,

          postedAt:
            job.postingDate,
        }
      )
  );
}


/**
 * Meta
 */
export async function fetchMetaJobs(
  company: any
): Promise<NormalizedJob[]> {

  const response = await fetch(
    'https://www.metacareers.com/jobs/feed/',
    {
      headers: BROWSER_HEADERS,
    }
  );


  if (!response.ok) {

    throw new Error(
      `Meta API ${response.status}`
    );

  }


  const data =
    await response.json();


  const jobs =
    data?.jobs || [];


  return jobs.map(
    (job: any) =>
      createNormalizedJob(
        company,
        {
          id:
            String(
              job.id ||
              job.job_id
            ),

          title:
            job.title,

          location:
            job.location,

          description:
            job.description,

          url:
            job.apply_url ||
            `https://www.metacareers.com/jobs/${job.id}`,

          postedAt:
            job.created_time,
        }
      )
  );
}


/**
 * ByteDance / TikTok
 */
export async function fetchByteDanceJobs(
  company: any
): Promise<NormalizedJob[]> {

  const response = await fetch(
    'https://jobs.bytedance.com/api/v1/search/job',
    {
      headers: BROWSER_HEADERS,
    }
  );


  if (!response.ok) {

    throw new Error(
      `ByteDance API ${response.status}`
    );

  }


  const data =
    await response.json();


  const jobs =
    data?.data?.job_list ||
    data?.jobs ||
    [];


  return jobs.map(
    (job: any) =>
      createNormalizedJob(
        company,
        {
          id:
            String(
              job.id ||
              job.job_id
            ),

          title:
            job.title,

          location:
            job.city,

          description:
            job.description,

          url:
            job.url ||
            `https://jobs.bytedance.com/position/${job.id}`,

          postedAt:
            job.create_time,
        }
      )
  );
}


/**
 * Nvidia
 */
export async function fetchNvidiaJobs(
  company: any
): Promise<NormalizedJob[]> {

  const response = await fetch(
    'https://nvidia.wd5.myworkdayjobs.com/wday/cxs/nvidia/NVIDIAExternalCareerSite/jobs',
    {
      headers: BROWSER_HEADERS,
    }
  );


  if (!response.ok) {

    throw new Error(
      `Nvidia API ${response.status}`
    );

  }


  const data =
    await response.json();


  const jobs =
    data?.jobPostings ||
    [];


  return jobs.map(
    (job: any) =>
      createNormalizedJob(
        company,
        {
          id:
            String(job.bulletFields?.reqId || job.id),

          title:
            job.title,

          location:
            job.locations?.[0],

          description:
            job.description,

          url:
            `https://nvidia.wd5.myworkdayjobs.com${job.externalPath}`,

          postedAt:
            undefined,
        }
      )
  );
}


/**
 * Tesla
 */
export async function fetchTeslaJobs(
  company: any
): Promise<NormalizedJob[]> {

  const response = await fetch(
    'https://www.tesla.com/cua-api/tesla-careers/search',
    {
      headers: BROWSER_HEADERS,
    }
  );


  if (!response.ok) {

    throw new Error(
      `Tesla API ${response.status}`
    );

  }


  const data =
    await response.json();


  const jobs =
    data?.jobs ||
    data?.results ||
    [];


  return jobs.map(
    (job: any) =>
      createNormalizedJob(
        company,
        {
          id:
            String(
              job.id ||
              job.jobId
            ),

          title:
            job.title,

          location:
            job.location,

          description:
            job.description,

          url:
            job.url ||
            `https://www.tesla.com/careers/search/job/${job.id}`,

          postedAt:
            job.createdAt,
        }
      )
  );
}


/**
 * Apple
 */
export async function fetchAppleJobs(
  company: any
): Promise<NormalizedJob[]> {

  const response = await fetch(
    'https://jobs.apple.com/api/role/search',
    {
      headers: BROWSER_HEADERS,
    }
  );


  if (!response.ok) {

    throw new Error(
      `Apple API ${response.status}`
    );

  }


  const data =
    await response.json();


  const jobs =
    data?.searchResults ||
    data?.results ||
    [];


  return jobs.map(
    (job: any) =>
      createNormalizedJob(
        company,
        {
          id:
            String(
              job.id ||
              job.positionId
            ),

          title:
            job.postingTitle ||
            job.title,

          location:
            job.locations?.[0]
              ?.name ||
            job.location,

          description:
            job.description,

          url:
            job.url ||
            `https://jobs.apple.com/details/${job.id}`,

          postedAt:
            job.postedDate,
        }
      )
  );
}
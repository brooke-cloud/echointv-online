// lib/jobs/custom-fetchers.ts

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
};

export interface RawCustomJob {
  id: string;
  title: string;
  location: string;
  url: string;
  description?: string;
  updatedAt?: string;
}

/**
 * 1. Amazon 官方开放 JSON 接口
 */
export async function fetchAmazonJobs(): Promise<RawCustomJob[]> {
  const url =
    'https://www.amazon.jobs/en/search.json?category[]=software-development&country[]=USA&result_type=jobs';
  const res = await fetch(url, { headers: BROWSER_HEADERS });
  if (!res.ok) throw new Error(`Amazon API error: ${res.status}`);
  const data = await res.json();

  return (data.jobs || []).map((job: any) => ({
    id: String(job.id_icims || job.id),
    title: job.title,
    location: job.location || job.city || 'United States',
    url: `https://www.amazon.jobs${job.job_path}`,
    description: job.basic_qualifications || job.description,
    updatedAt: job.posted_date,
  }));
}

/**
 * 2. 微软官方 GCSServices 搜索接口
 */
export async function fetchMicrosoftJobs(): Promise<RawCustomJob[]> {
  const url =
    'https://gcsservices.careers.microsoft.com/search/api/v1/search?lc=United%20States&exp=Students%20and%20graduates&p=Software%20Engineering';
  const res = await fetch(url, { headers: BROWSER_HEADERS });
  if (!res.ok) throw new Error(`Microsoft API error: ${res.status}`);
  const data = await res.json();

  const jobs = data?.operationResult?.result?.jobs || [];
  return jobs.map((job: any) => ({
    id: String(job.jobId),
    title: job.title,
    location: job.properties?.primaryLocation || 'United States',
    url: `https://jobs.careers.microsoft.com/global/en/job/${job.jobId}`,
    description: job.properties?.description || '',
    updatedAt: job.postingDate,
  }));
}

/**
 * 3. Google Careers 内部搜索接口
 */
export async function fetchGoogleJobs(): Promise<RawCustomJob[]> {
  const url =
    'https://careers.google.com/api/v3/search/?degree_levels=BACHELORS&employment_types=FULL_TIME&employment_types=INTERN&j=Software%20Engineer&location=United%20States';
  const res = await fetch(url, { headers: BROWSER_HEADERS });
  if (!res.ok) throw new Error(`Google API error: ${res.status}`);
  const data = await res.json();

  return (data.jobs || []).map((job: any) => ({
    id: String(job.id),
    title: job.title,
    location: job.locations?.[0]?.display_name || 'United States',
    url: job.apply_url || `https://careers.google.com/jobs/results/${job.id}`,
    description: job.summary || '',
    updatedAt: job.created,
  }));
}
// lib/jobs/adapters/greenhouse.ts
import { AtsAdapter, NormalizedJob } from './types';
import { classifyJob } from '../normalizer';

interface GreenhouseRawJob {
  id: number | string;
  title: string;
  absolute_url: string;
  location?: { name?: string };
  offices?: Array<{ name?: string }>;
  departments?: Array<{ id: number; name: string }>;
  updated_at?: string;
  content?: string;
}

export class GreenhouseAdapter implements AtsAdapter {
  async fetchJobs(companyName: string, companySlug: string, identifier: string): Promise<NormalizedJob[]> {
    const url = `https://boards-api.greenhouse.io/v1/boards/${identifier}/jobs?content=true`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'EchoInterview-JobRadar/2.0',
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      throw new Error(`[Greenhouse] API failed for ${companyName} (${identifier}): ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const rawJobs: GreenhouseRawJob[] = data.jobs || [];

    return rawJobs.map((job) => {
      const rawLocation = job.location?.name?.trim() || 'US / Unspecified';
      const offices = (job.offices || []).map((o) => o.name?.trim()).filter(Boolean) as string[];
      const deptName = (job.departments || []).map((d) => d.name.trim()).join(', ');

      const classification = classifyJob(job.title, rawLocation, job.content || '', deptName);
      const id = String(job.id);

      return {
        reqId: id,
        externalJobId: id,
        company: companyName,
        companyName,
        companySlug,
        title: job.title.trim(),
        location: rawLocation,
        locations: offices.length > 0 ? offices : [rawLocation],
        isRemote: classification.isRemote,
        department: deptName || undefined,
        employmentType: classification.jobType,
        category: classification.track,
        track: classification.track,
        level: classification.level,
        description: job.content ? job.content.slice(0, 2000) : undefined,
        jobUrl: job.absolute_url,
        applyUrl: `${job.absolute_url}#app`,
        postedAt: job.updated_at ? new Date(job.updated_at) : new Date(),
        source: 'greenhouse',
        ats: 'greenhouse',
      };
    });
  }
}
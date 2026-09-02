// lib/jobs/adapters/ashby.ts
import { AtsAdapter, NormalizedJob } from './types';
import { classifyJob } from '../normalizer';

interface AshbyRawJob {
  id: string;
  title: string;
  locationName?: string;
  isRemote?: boolean;
  jobUrl: string;
  publishedAt?: string;
  descriptionPlain?: string;
  departmentName?: string;
  teamName?: string;
  employmentType?: string;
  secondaryLocations?: Array<{ locationName?: string }>;
}

interface AshbyBoardResponse {
  jobs: AshbyRawJob[];
}

export class AshbyAdapter implements AtsAdapter {
  async fetchJobs(companyName: string, companySlug: string, identifier: string): Promise<NormalizedJob[]> {
    const url = `https://api.ashbyhq.com/posting-api/job-board/${identifier}`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'EchoInterview-JobRadar/2.0',
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      throw new Error(`[Ashby] API failed for ${companyName} (${identifier}): ${response.status} ${response.statusText}`);
    }

    const data: AshbyBoardResponse = await response.json();
    const rawJobs: AshbyRawJob[] = data.jobs || [];

    return rawJobs.map((job) => {
      const rawLocation = job.locationName?.trim() || 'US / Unspecified';
      const secondLocs = (job.secondaryLocations || []).map((l) => l.locationName?.trim()).filter(Boolean) as string[];
      const dept = `${job.departmentName || ''} ${job.teamName || ''}`.trim();

      const classification = classifyJob(job.title, rawLocation, job.descriptionPlain || '', dept);

      return {
        reqId: job.id,
        externalJobId: job.id,
        company: companyName,
        companyName,
        companySlug,
        title: job.title.trim(),
        location: rawLocation,
        locations: [rawLocation, ...secondLocs],
        isRemote: Boolean(job.isRemote || classification.isRemote),
        department: job.departmentName,
        team: job.teamName,
        employmentType: job.employmentType || classification.jobType,
        category: classification.track,
        track: classification.track,
        level: classification.level,
        description: job.descriptionPlain ? job.descriptionPlain.slice(0, 2000) : undefined,
        jobUrl: job.jobUrl,
        applyUrl: `${job.jobUrl}/application`,
        postedAt: job.publishedAt ? new Date(job.publishedAt) : new Date(),
        source: 'ashby',
        ats: 'ashby',
      };
    });
  }
}
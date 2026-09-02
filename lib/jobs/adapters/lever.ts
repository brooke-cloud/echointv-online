// lib/jobs/adapters/lever.ts
import { AtsAdapter, NormalizedJob } from './types';
import { classifyJob } from '../normalizer';

interface LeverRawJob {
  id: string;
  text: string;
  hostedUrl: string;
  applyUrl?: string;
  createdAt: number;
  categories?: {
    commitment?: string;
    location?: string;
    team?: string;
    department?: string;
    allLocations?: string[];
  };
  descriptionPlain?: string;
}

export class LeverAdapter implements AtsAdapter {
  async fetchJobs(companyName: string, companySlug: string, identifier: string): Promise<NormalizedJob[]> {
    const url = `https://api.lever.co/v0/postings/${identifier}?mode=json`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'EchoInterview-JobRadar/2.0',
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      throw new Error(`[Lever] API failed for ${companyName} (${identifier}): ${response.status} ${response.statusText}`);
    }

    const rawJobs: LeverRawJob[] = await response.json();

    return (rawJobs || []).map((job) => {
      const rawLocation = job.categories?.location?.trim() || 'US / Unspecified';
      const allLocs = job.categories?.allLocations || (rawLocation ? [rawLocation] : []);
      const deptName = `${job.categories?.department || ''} ${job.categories?.team || ''}`.trim();

      const classification = classifyJob(job.text, rawLocation, job.descriptionPlain || '', deptName);

      return {
        reqId: job.id,
        externalJobId: job.id,
        company: companyName,
        companyName,
        companySlug,
        title: job.text.trim(),
        location: rawLocation,
        locations: allLocs,
        isRemote: classification.isRemote,
        department: job.categories?.department,
        team: job.categories?.team,
        employmentType: job.categories?.commitment || classification.jobType,
        category: classification.track,
        track: classification.track,
        level: classification.level,
        description: job.descriptionPlain ? job.descriptionPlain.slice(0, 2000) : undefined,
        jobUrl: job.hostedUrl,
        applyUrl: job.applyUrl || job.hostedUrl,
        postedAt: job.createdAt ? new Date(job.createdAt) : new Date(),
        source: 'lever',
        ats: 'lever',
      };
    });
  }
}
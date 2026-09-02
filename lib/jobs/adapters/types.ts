// lib/jobs/adapters/types.ts

export type SupportedAts = 'greenhouse' | 'lever' | 'ashby' | 'custom';

export interface NormalizedJob {
  reqId: string;
  externalJobId: string;
  company: string;
  companyName: string;
  companySlug: string;
  title: string;
  location: string;
  locations?: string[];
  isRemote: boolean;
  department?: string;
  team?: string;
  employmentType?: string;
  category: string;
  track: string;
  level?: string;
  salary?: string;
  description?: string;
  jobUrl?: string;
  applyUrl: string;
  postedAt: Date;
  source: string;
  ats: string;
}

export interface AtsAdapter {
  fetchJobs(companyName: string, companySlug: string, identifier: string): Promise<NormalizedJob[]>;
}
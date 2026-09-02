// lib/jobs/adapters/index.ts
import { AtsAdapter, NormalizedJob, SupportedAts } from './types';
import { GreenhouseAdapter } from './greenhouse';
import { LeverAdapter } from './lever';
import { AshbyAdapter } from './ashby';

// 实例化单例适配器
const greenhouseAdapter = new GreenhouseAdapter();
const leverAdapter = new LeverAdapter();
const ashbyAdapter = new AshbyAdapter();

/**
 * 根据公司的 ATS 类型分发至对应官方 API 适配器
 */
export async function fetchJobsByAts(
  companyName: string,
  companySlug: string,
  atsType: string,
  identifier: string
): Promise<NormalizedJob[]> {
  const normalizedAts = atsType.toLowerCase() as SupportedAts;

  switch (normalizedAts) {
    case 'greenhouse':
      return await greenhouseAdapter.fetchJobs(companyName, companySlug, identifier);
    case 'lever':
      return await leverAdapter.fetchJobs(companyName, companySlug, identifier);
    case 'ashby':
      return await ashbyAdapter.fetchJobs(companyName, companySlug, identifier);
    case 'custom':
      // 预留给亚马逊等自建 ATS，将在后续步骤对接
      return [];
    default:
      console.warn(`[ATS Adapter] Unsupported ATS platform: ${atsType} for ${companyName}`);
      return [];
  }
}

export * from './types';
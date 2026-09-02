// lib/jobs/company-config.ts

export type AtsType = 'GREENHOUSE' | 'LEVER' | 'ASHBY' | 'CUSTOM';

export type RegionType = 'US' | 'GLOBAL' | 'APAC' | 'EMEA';

export type CompanyTier = 'BIG_TECH' | 'AI_UNICORN' | 'HIGH_GROWTH' | 'FINTECH';

export interface CompanyConfig {
  name: string;
  slug: string;
  region: RegionType | string;
  ats: AtsType;
  identifier: string;
  careerUrl: string;
  enabled: boolean;
  tier?: CompanyTier;
  customConfig?: {
    endpoint?: string;
    authHeader?: string;
    extraParams?: Record<string, unknown>;
  };
}

export interface NormalizedJob {
  reqId: string;
  title: string;
  company: string;
  companySlug: string;
  location: string;
  isRemote: boolean;
  category: string;
  employmentType?: string;
  applyUrl: string;
  description?: string;
  postedAt: Date | string;
  source: AtsType;
  rawPayload?: Record<string, unknown>;
}

export const COMPANY_CONFIGS: CompanyConfig[] = [
  // ================= 1. MAMAA & 超级大厂 =================
  {
    name: 'Google',
    slug: 'google',
    region: 'GLOBAL',
    ats: 'CUSTOM',
    identifier: 'google-students',
    careerUrl: 'https://careers.google.com/students/',
    tier: 'BIG_TECH',
    enabled: true,
  },
  {
    name: 'Amazon',
    slug: 'amazon',
    region: 'GLOBAL',
    ats: 'CUSTOM',
    identifier: 'amazon-students',
    careerUrl: 'https://www.amazon.jobs/en/business_categories/student-programs',
    tier: 'BIG_TECH',
    enabled: true,
  },
  {
    name: 'Microsoft',
    slug: 'microsoft',
    region: 'GLOBAL',
    ats: 'CUSTOM',
    identifier: 'microsoft-students',
    careerUrl: 'https://careers.microsoft.com/v2/global/en/exploremicrosoft',
    tier: 'BIG_TECH',
    enabled: true,
  },
  {
    name: 'Apple',
    slug: 'apple',
    region: 'GLOBAL',
    ats: 'CUSTOM',
    identifier: 'apple-students',
    careerUrl: 'https://www.apple.com/careers/us/students.html',
    tier: 'BIG_TECH',
    enabled: true,
  },
  {
    name: 'Tesla',
    slug: 'tesla',
    region: 'GLOBAL',
    ats: 'CUSTOM',
    identifier: 'tesla-internships',
    careerUrl: 'https://www.tesla.com/careers/internships',
    tier: 'BIG_TECH',
    enabled: true,
  },

  // ================= 2. AI 核心独角兽 =================
  {
    name: 'OpenAI',
    slug: 'openai',
    region: 'US',
    ats: 'ASHBY',
    identifier: 'openai',
    careerUrl: 'https://openai.com/careers/search',
    tier: 'AI_UNICORN',
    enabled: true,
  },
  {
    name: 'Scale AI',
    slug: 'scaleai',
    region: 'US',
    ats: 'GREENHOUSE',
    identifier: 'scaleai',
    careerUrl: 'https://scale.com/careers',
    tier: 'AI_UNICORN',
    enabled: true,
  },
  {
    name: 'Perplexity',
    slug: 'perplexity',
    region: 'US',
    ats: 'ASHBY',
    identifier: 'perplexity',
    careerUrl: 'https://www.perplexity.ai/careers',
    tier: 'AI_UNICORN',
    enabled: true,
  },

  // ================= 3. 一线高薪科技大厂 =================
  {
    name: 'Stripe',
    slug: 'stripe',
    region: 'US',
    ats: 'GREENHOUSE',
    identifier: 'stripe',
    careerUrl: 'https://stripe.com/jobs',
    tier: 'HIGH_GROWTH',
    enabled: true,
  },
  {
    name: 'Databricks',
    slug: 'databricks',
    region: 'US',
    ats: 'GREENHOUSE',
    identifier: 'databricks',
    careerUrl: 'https://www.databricks.com/company/careers',
    tier: 'AI_UNICORN',
    enabled: true,
  },
  {
    name: 'Figma',
    slug: 'figma',
    region: 'US',
    ats: 'GREENHOUSE',
    identifier: 'figma',
    careerUrl: 'https://www.figma.com/careers/',
    tier: 'HIGH_GROWTH',
    enabled: true,
  },
  {
    name: 'Palantir',
    slug: 'palantir',
    region: 'US',
    ats: 'LEVER',
    identifier: 'palantir',
    careerUrl: 'https://www.palantir.com/careers/',
    tier: 'BIG_TECH',
    enabled: true,
  },
  {
    name: 'Airbnb',
    slug: 'airbnb',
    region: 'US',
    ats: 'GREENHOUSE',
    identifier: 'airbnb',
    careerUrl: 'https://careers.airbnb.com/',
    tier: 'BIG_TECH',
    enabled: true,
  },
  {
    name: 'Coinbase',
    slug: 'coinbase',
    region: 'US',
    ats: 'GREENHOUSE',
    identifier: 'coinbase',
    careerUrl: 'https://www.coinbase.com/careers',
    tier: 'HIGH_GROWTH',
    enabled: true,
  },
  {
    name: 'Pinterest',
    slug: 'pinterest',
    region: 'US',
    ats: 'GREENHOUSE',
    identifier: 'pinterest',
    careerUrl: 'https://www.pinterestcareers.com/',
    tier: 'BIG_TECH',
    enabled: true,
  },
  {
    name: 'Reddit',
    slug: 'reddit',
    region: 'US',
    ats: 'GREENHOUSE',
    identifier: 'reddit',
    careerUrl: 'https://www.redditinc.com/careers',
    tier: 'HIGH_GROWTH',
    enabled: true,
  },
  {
    name: 'Cloudflare',
    slug: 'cloudflare',
    region: 'US',
    ats: 'GREENHOUSE',
    identifier: 'cloudflare',
    careerUrl: 'https://www.cloudflare.com/careers/',
    tier: 'HIGH_GROWTH',
    enabled: true,
  },
  {
    name: 'Datadog',
    slug: 'datadog',
    region: 'US',
    ats: 'GREENHOUSE',
    identifier: 'datadog',
    careerUrl: 'https://www.datadoghq.com/careers/',
    tier: 'HIGH_GROWTH',
    enabled: true,
  },
  {
    name: 'Roblox',
    slug: 'roblox',
    region: 'US',
    ats: 'GREENHOUSE',
    identifier: 'roblox',
    careerUrl: 'https://careers.roblox.com/',
    tier: 'HIGH_GROWTH',
    enabled: true,
  },
  {
    name: 'Ramp',
    slug: 'ramp',
    region: 'US',
    ats: 'ASHBY',
    identifier: 'ramp',
    careerUrl: 'https://ramp.com/careers',
    tier: 'FINTECH',
    enabled: true,
  },
  {
    name: 'Linear',
    slug: 'linear',
    region: 'GLOBAL',
    ats: 'ASHBY',
    identifier: 'linear',
    careerUrl: 'https://linear.app/careers',
    tier: 'HIGH_GROWTH',
    enabled: true,
  },
  {
    name: 'Discord',
    slug: 'discord',
    region: 'US',
    ats: 'GREENHOUSE',
    identifier: 'discord',
    careerUrl: 'https://discord.com/careers',
    tier: 'HIGH_GROWTH',
    enabled: true,
  },
];

export function getActiveCompanyConfigs(): CompanyConfig[] {
  return COMPANY_CONFIGS.filter((config) => config.enabled);
}

export function getCompanyConfigBySlug(slug: string): CompanyConfig | undefined {
  return COMPANY_CONFIGS.find((config) => config.slug.toLowerCase() === slug.toLowerCase());
}

export function getCompanyConfigsByAts(ats: AtsType): CompanyConfig[] {
  return COMPANY_CONFIGS.filter((config) => config.ats === ats && config.enabled);
}
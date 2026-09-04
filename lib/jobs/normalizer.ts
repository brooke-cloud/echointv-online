// lib/jobs/normalizer.ts

import { classifyTargetJob } from './target-classifier';

export interface ClassificationResult {
  isTech: boolean;
  region: 'North America' | 'China' | 'Remote' | 'Other';
  track: string;
  jobType: 'Full-time' | 'Intern' | 'New Grad' | 'Contract' | 'Part-time';
  level: string;
  isRemote: boolean;
  tags: string[];
}

/**
 * ---------------------------------------------------------------------------
 * Non-tech keywords
 * ---------------------------------------------------------------------------
 */

const NON_TECH_KEYWORDS = [
  'account executive',
  'sales representative',
  'sales manager',
  'sales director',
  'recruiter',
  'recruiting coordinator',
  'talent acquisition',
  'people operations',
  'human resources',
  'hr generalist',
  'hr manager',
  'hr business partner',
  'legal counsel',
  'attorney',
  'paralegal',
  'compliance officer',
  'payroll',
  'accountant',
  'accounting manager',
  'accounts payable',
  'tax manager',
  'workplace coordinator',
  'office manager',
  'executive assistant',
  'receptionist',
  'event coordinator',
  'facilities specialist',
  'customer support specialist',
  'brand designer',
  'copywriter',
  'content strategist',
  'public relations',
  'strategy & execution',
  'business development representative',
  'bdr',
  'sdr',
];

/**
 * ---------------------------------------------------------------------------
 * Common technical tags
 * ---------------------------------------------------------------------------
 */

const COMMON_TECH_TAGS = [
  'Python',
  'Java',
  'Go',
  'Golang',
  'C++',
  'Rust',
  'TypeScript',
  'JavaScript',
  'React',
  'Next.js',
  'Vue',
  'Node.js',
  'PyTorch',
  'TensorFlow',
  'LLM',
  'CUDA',
  'Kubernetes',
  'Docker',
  'AWS',
  'GCP',
  'Azure',
  'PostgreSQL',
  'Redis',
  'Kafka',
  'GraphQL',
  'Spark',
  'Flink',
  'Android',
  'iOS',
  'Swift',
  'Kotlin',
  'Linux',
];

/**
 * ---------------------------------------------------------------------------
 * Helpers
 * ---------------------------------------------------------------------------
 */

function normalizeText(value: string = ''): string {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function lower(value: string = ''): string {
  return normalizeText(value).toLowerCase();
}

/**
 * Avoid false-positive matches for very short programming language names
 * such as "Go".
 */
function matchTechTag(text: string, tag: string): boolean {
  const lowerText = text.toLowerCase();
  const lowerTag = tag.toLowerCase();

  if (lowerTag === 'c++') {
    return (
      lowerText.includes('c++') ||
      lowerText.includes('cpp')
    );
  }

  if (lowerTag === 'go') {
    return (
      /\bgo\b/i.test(text) ||
      lowerText.includes('golang')
    );
  }

  return lowerText.includes(lowerTag);
}

/**
 * ---------------------------------------------------------------------------
 * Technical job detection
 * ---------------------------------------------------------------------------
 */

export function isTechnicalJob(
  title: string,
  department: string = ''
): boolean {
  const t = lower(title);
  const d = lower(department);

  /**
   * First remove obvious non-technical roles.
   */
  for (const nonTech of NON_TECH_KEYWORDS) {
    if (t.includes(nonTech) || d.includes(nonTech)) {
      return false;
    }
  }

  const TECH_INDICATORS = [
    'engineer',
    'engineering',
    'developer',
    'software',
    'swe',
    'sde',
    'architect',
    'scientist',
    'machine learning',
    'ai ',
    'ml ',
    'deep learning',
    'frontend',
    'front-end',
    'front end',
    'backend',
    'back-end',
    'back end',
    'fullstack',
    'full-stack',
    'full stack',
    'devops',
    'sre',
    'infrastructure',
    'infra',
    'cloud',
    'platform',
    'data',
    'analytics',
    'database',
    'security',
    'infosec',
    'cyber',
    'mobile',
    'ios',
    'android',
    'embedded',
    'firmware',
    'hardware',
    'tpm',
    'technical product manager',
    'product manager',
    'solutions architect',
    'qa',
    'test engineer',
    'sdet',
    'algorithm',
    'researcher',
    'intern',
    'member of technical staff',
    'technical staff',
    'mts',
    'research scientist',
    'research engineer',
    'applied scientist',
    'core contributor',
    'fellow',
    'ai support',
  ];

  return TECH_INDICATORS.some(
    (indicator) =>
      t.includes(indicator) ||
      d.includes(indicator)
  );
}

/**
 * ---------------------------------------------------------------------------
 * Remote detection
 * ---------------------------------------------------------------------------
 */

function detectRemote(
  title: string,
  location: string
): boolean {
  const t = lower(title);
  const l = lower(location);

  return (
    l.includes('remote') ||
    l.includes('anywhere') ||
    l.includes('virtual') ||
    l.includes('work from home') ||
    t.includes('(remote)') ||
    t.includes('[remote]') ||
    t.includes('remote -') ||
    t.includes('remote —')
  );
}

/**
 * ---------------------------------------------------------------------------
 * Region detection
 * ---------------------------------------------------------------------------
 */

function detectRegion(
  location: string,
  isRemote: boolean
): 'North America' | 'China' | 'Remote' | 'Other' {
  const loc = lower(location);

  if (isRemote) {
    return 'Remote';
  }

  /**
   * China / Greater China.
   */
  if (
    loc.includes('china') ||
    loc.includes('beijing') ||
    loc.includes('shanghai') ||
    loc.includes('shenzhen') ||
    loc.includes('hangzhou') ||
    loc.includes('guangzhou') ||
    loc.includes('chengdu') ||
    loc.includes('nanjing') ||
    loc.includes('suzhou') ||
    loc.includes('wuhan') ||
    loc.includes('hong kong') ||
    loc.includes('macau') ||
    loc.includes('中国') ||
    loc.includes('北京') ||
    loc.includes('上海') ||
    loc.includes('深圳') ||
    loc.includes('杭州') ||
    loc.includes('广州') ||
    loc.includes('成都') ||
    loc.includes('香港') ||
    loc.includes('澳门')
  ) {
    return 'China';
  }

  /**
   * North America.
   */
  if (
    loc.includes('united states') ||
    loc.includes('usa') ||
    loc.includes('u.s.') ||
    loc.includes('canada') ||
    loc.includes('seattle') ||
    loc.includes('san francisco') ||
    loc.includes('bay area') ||
    loc.includes('new york') ||
    loc.includes('sunnyvale') ||
    loc.includes('austin') ||
    loc.includes('toronto') ||
    loc.includes('vancouver') ||
    loc.includes('boston') ||
    loc.includes('chicago') ||
    loc.includes('los angeles') ||
    loc.includes('san diego') ||
    loc.includes('palo alto') ||
    loc.includes('mountain view') ||
    loc.includes('cupertino') ||
    loc.includes('redmond') ||
    loc.includes('california') ||
    loc.includes('texas') ||
    loc.includes('washington')
  ) {
    return 'North America';
  }

  return 'Other';
}

/**
 * ---------------------------------------------------------------------------
 * Track detection
 * ---------------------------------------------------------------------------
 */

function inferTrack(
  title: string,
  department: string = '',
  description: string = ''
): string {
  const t = lower(title);
  const d = lower(department);
  const desc = lower(description).slice(0, 3000);

  const text = `${t} ${d} ${desc}`;

  /**
   * AI / ML
   */
  if (
    t.includes('machine learning') ||
    t.includes('ml engineer') ||
    t.includes('deep learning') ||
    t.includes('artificial intelligence') ||
    t.includes('ai engineer') ||
    t.includes('ai researcher') ||
    t.includes('research scientist') ||
    t.includes('applied scientist') ||
    t.includes('data scientist') ||
    t.includes('computer vision') ||
    t.includes('natural language processing') ||
    t.includes('nlp') ||
    t.includes('llm') ||
    t.includes('generative ai') ||
    t.includes('genai') ||
    t.includes('reinforcement learning') ||
    text.includes('pytorch') ||
    text.includes('tensorflow')
  ) {
    return 'AI/ML';
  }

  /**
   * Frontend
   */
  if (
    t.includes('frontend') ||
    t.includes('front-end') ||
    t.includes('front end') ||
    t.includes('ui engineer') ||
    t.includes('web developer') ||
    t.includes('web engineer')
  ) {
    return 'Frontend';
  }

  /**
   * Backend
   */
  if (
    t.includes('backend') ||
    t.includes('back-end') ||
    t.includes('back end') ||
    t.includes('server engineer') ||
    t.includes('distributed systems') ||
    t.includes('api engineer') ||
    t.includes('services engineer')
  ) {
    return 'Backend';
  }

  /**
   * Data
   */
  if (
    t.includes('data engineer') ||
    t.includes('data platform') ||
    t.includes('analytics engineer') ||
    t.includes('big data') ||
    t.includes('database engineer') ||
    t.includes('data infrastructure')
  ) {
    return 'Data';
  }

  /**
   * DevOps / Infrastructure
   */
  if (
    t.includes('devops') ||
    t.includes('site reliability') ||
    t.includes('sre') ||
    t.includes('infrastructure') ||
    t.includes('infra engineer') ||
    t.includes('cloud engineer') ||
    t.includes('platform engineer') ||
    t.includes('systems engineer') ||
    t.includes('solutions architect') ||
    t.includes('cloud architect')
  ) {
    return 'DevOps';
  }

  /**
   * Mobile
   */
  if (
    t.includes('mobile') ||
    t.includes('ios') ||
    t.includes('android') ||
    t.includes('swift') ||
    t.includes('kotlin') ||
    t.includes('flutter')
  ) {
    return 'Mobile';
  }

  /**
   * Security
   */
  if (
    t.includes('security engineer') ||
    t.includes('security') ||
    t.includes('infosec') ||
    t.includes('application security') ||
    t.includes('cybersecurity') ||
    t.includes('cyber security')
  ) {
    return 'Security';
  }

  /**
   * Embedded / Hardware
   */
  if (
    t.includes('embedded') ||
    t.includes('firmware') ||
    t.includes('hardware') ||
    t.includes('iot') ||
    t.includes('robotics')
  ) {
    return 'Embedded';
  }

  /**
   * Product / Technical PM
   */
  if (
    t.includes('technical product manager') ||
    t.includes('technical program manager') ||
    t.includes('tpm')
  ) {
    return 'Technical Product';
  }

  /**
   * Generic software engineering.
   */
  if (
    t.includes('software engineer') ||
    t.includes('software developer') ||
    t.includes('sde') ||
    t.includes('swe') ||
    t.includes('developer') ||
    t.includes('engineering')
  ) {
    return 'Fullstack';
  }

  return 'Other';
}

/**
 * ---------------------------------------------------------------------------
 * Level detection
 * ---------------------------------------------------------------------------
 */

function inferLevel(
  title: string,
  jobType: ClassificationResult['jobType']
): string {
  const t = lower(title);

  if (jobType === 'Intern') {
    return 'Intern';
  }

  if (jobType === 'New Grad') {
    return 'Entry/Junior';
  }

  if (
    t.includes('staff') ||
    t.includes('principal') ||
    t.includes('distinguished') ||
    t.includes('fellow')
  ) {
    return 'Staff/Principal';
  }

  if (
    t.includes('senior') ||
    t.includes('sr.') ||
    t.includes('sr ') ||
    /\bsde\s+(?:iii|3)\b/i.test(t) ||
    /\bswe\s+(?:iii|3)\b/i.test(t)
  ) {
    return 'Senior';
  }

  if (
    t.includes('lead') ||
    t.includes('manager') ||
    t.includes('director') ||
    t.includes('head of')
  ) {
    return 'Lead/Mgr';
  }

  if (
    t.includes('junior') ||
    t.includes('associate') ||
    t.includes('entry level') ||
    t.includes('entry-level') ||
    t.includes('level 1') ||
    t.includes('level i') ||
    /\bsde\s+(?:i|1)\b/i.test(t) ||
    /\bswe\s+(?:i|1)\b/i.test(t)
  ) {
    return 'Entry/Junior';
  }

  return 'Mid';
}

/**
 * ---------------------------------------------------------------------------
 * Job type normalization
 * ---------------------------------------------------------------------------
 *
 * target-classifier.ts is now the single source of truth for:
 *
 *   Intern
 *   New Grad
 *   Experienced
 *
 * Contract and Part-time remain separate employment categories.
 */

function normalizeJobType(
  title: string,
  description: string,
  department: string,
  employmentType?: string
): ClassificationResult['jobType'] {
  const titleText = lower(title);
  const employment = lower(employmentType);

  /**
   * Structured employment type first.
   */
  if (
    employment.includes('contractor') ||
    employment === 'contract' ||
    employment.includes('contract')
  ) {
    return 'Contract';
  }

  if (
    employment === 'part-time' ||
    employment === 'part time' ||
    employment.includes('parttime')
  ) {
    return 'Part-time';
  }

  /**
   * The target classifier owns Intern / New Grad classification.
   */
  const target = classifyTargetJob({
    title,
    description,
    department,
    employmentType,
  });

  if (target.type === 'Intern') {
    return 'Intern';
  }

  if (target.type === 'New Grad') {
    return 'New Grad';
  }

  /**
   * Contract / part-time can also appear only in the title.
   */
  if (
    titleText.includes('contractor') ||
    titleText.includes('contract position') ||
    titleText.includes('contract role')
  ) {
    return 'Contract';
  }

  if (
    titleText.includes('part-time') ||
    titleText.includes('part time')
  ) {
    return 'Part-time';
  }

  return 'Full-time';
}

/**
 * ---------------------------------------------------------------------------
 * Main classifier
 * ---------------------------------------------------------------------------
 */

export function classifyJob(
  title: string,
  location: string,
  description: string = '',
  department: string = '',
  employmentType?: string
): ClassificationResult {
  const normalizedTitle = normalizeText(title);
  const normalizedLocation = normalizeText(location);
  const normalizedDescription = normalizeText(description);
  const normalizedDepartment = normalizeText(department);

  const isTech = isTechnicalJob(
    normalizedTitle,
    normalizedDepartment
  );

  const isRemote = detectRemote(
    normalizedTitle,
    normalizedLocation
  );

  const region = detectRegion(
    normalizedLocation,
    isRemote
  );

  /**
   * IMPORTANT:
   *
   * Intern / New Grad / Experienced classification is delegated to
   * target-classifier.ts.
   */
  const jobType = normalizeJobType(
    normalizedTitle,
    normalizedDescription,
    normalizedDepartment,
    employmentType
  );

  const level = inferLevel(
    normalizedTitle,
    jobType
  );

  const track = inferTrack(
    normalizedTitle,
    normalizedDepartment,
    normalizedDescription
  );

  /**
   * Tags are generated from the entire relevant text.
   */
  const combinedText = [
    normalizedTitle,
    normalizedDepartment,
    normalizedLocation,
    normalizedDescription.slice(0, 3000),
  ].join(' ');

  const tags: string[] = [];

  for (const tag of COMMON_TECH_TAGS) {
    if (matchTechTag(combinedText, tag)) {
      tags.push(tag);

      /**
       * Avoid excessively large tag arrays.
       */
      if (tags.length >= 6) {
        break;
      }
    }
  }

  /**
   * If the job is technical but no specific technology was detected,
   * use the track as a fallback tag.
   */
  if (tags.length === 0 && isTech && track !== 'Other') {
    tags.push(track);
  }

  /**
   * Remote is useful as a tag for filtering/search.
   */
  if (isRemote && !tags.includes('Remote')) {
    tags.push('Remote');
  }

  return {
    isTech,
    region,
    track,
    jobType,
    level,
    isRemote,
    tags,
  };
}
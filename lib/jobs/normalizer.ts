// lib/jobs/normalizer.ts

export interface ClassificationResult {
  isTech: boolean;
  region: 'North America' | 'China' | 'Remote' | 'Other';
  track: string;
  jobType: 'Full-time' | 'Intern' | 'New Grad' | 'Contract' | 'Part-time';
  level: string;
  isRemote: boolean;
  tags: string[];
}

const NON_TECH_KEYWORDS = [
  'account executive', 'sales representative', 'sales manager', 'sales director',
  'recruiter', 'recruiting coordinator', 'talent acquisition', 'people operations',
  'human resources', 'hr generalist', 'hr manager', 'hr business partner',
  'legal counsel', 'attorney', 'paralegal', 'compliance officer',
  'payroll', 'accountant', 'accounting manager', 'accounts payable', 'tax manager',
  'workplace coordinator', 'office manager', 'executive assistant', 'receptionist',
  'event coordinator', 'facilities specialist', 'customer support specialist',
  'brand designer', 'copywriter', 'content strategist', 'public relations',
  'strategy & execution', 'business development representative', 'bdr', 'sdr'
];

const COMMON_TECH_TAGS = [
  'Python', 'Java', 'Go', 'Golang', 'C++', 'Rust', 'TypeScript', 'JavaScript',
  'React', 'Next.js', 'Vue', 'Node.js', 'PyTorch', 'TensorFlow', 'LLM', 'CUDA',
  'Kubernetes', 'Docker', 'AWS', 'GCP', 'Azure', 'PostgreSQL', 'Redis', 'Kafka',
  'GraphQL', 'Spark', 'Flink', 'Android', 'iOS', 'Swift', 'Kotlin', 'Linux'
];

function matchTechTag(text: string, tag: string): boolean {
  const lowerText = text.toLowerCase();
  const lowerTag = tag.toLowerCase();

  if (lowerTag === 'c++') {
    return lowerText.includes('c++') || lowerText.includes('cpp');
  }
  if (lowerTag === 'go' || lowerTag === 'r') {
    return (
      lowerText.includes(' ' + lowerTag + ' ') ||
      lowerText.includes('/' + lowerTag + '/') ||
      lowerText.includes('(' + lowerTag + ')') ||
      lowerText.includes(',' + lowerTag) ||
      lowerText.startsWith(lowerTag + ' ') ||
      lowerText.endsWith(' ' + lowerTag) ||
      lowerText.includes('golang')
    );
  }
  return lowerText.includes(lowerTag);
}

export function isTechnicalJob(title: string, department: string = ''): boolean {
  const t = title.toLowerCase();
  const d = department.toLowerCase();

  for (const nonTech of NON_TECH_KEYWORDS) {
    if (t.includes(nonTech)) return false;
  }

  const TECH_INDICATORS = [
    'engineer', 'engineering', 'developer', 'software', 'swe', 'sde',
    'architect', 'scientist', 'machine learning', 'ai ', 'ml ', 'deep learning',
    'frontend', 'front-end', 'backend', 'back-end', 'fullstack', 'full-stack',
    'devops', 'sre', 'infrastructure', 'infra', 'cloud', 'platform',
    'data', 'analytics', 'database', 'security', 'infosec', 'cyber',
    'mobile', 'ios', 'android', 'embedded', 'firmware', 'hardware',
    'tpm', 'technical product manager', 'product manager', 'solutions architect',
    'qa', 'test engineer', 'sdet', 'algorithm', 'researcher', 'intern',
    'member of technical staff', 'technical staff', 'mts', 'research scientist',
    'research engineer', 'applied scientist', 'core contributor', 'fellow', 'ai support'
  ];

  return TECH_INDICATORS.some((ind) => t.includes(ind) || d.includes(ind));
}

export function classifyJob(
  title: string,
  location: string,
  description: string = '',
  department: string = ''
): ClassificationResult {
  const normalizedTitle = title.toLowerCase();
  const normalizedLoc = location.toLowerCase();
  const normalizedDept = department.toLowerCase();
  const descSnippet = description.slice(0, 1500).toLowerCase();
  const combinedText = `${normalizedTitle} ${normalizedDept} ${normalizedLoc} ${descSnippet}`;

  const isTech = isTechnicalJob(title, department);

  // 1. 是否 Remote
  const isRemote = (
    normalizedLoc.includes('remote') ||
    normalizedLoc.includes('anywhere') ||
    normalizedLoc.includes('virtual') ||
    normalizedLoc.includes('work from home') ||
    normalizedTitle.includes('(remote)') ||
    normalizedTitle.includes('[remote]')
  );

  // 2. 地区归属判定
  let region: 'North America' | 'China' | 'Remote' | 'Other' = 'North America';
  if (isRemote) {
    region = 'Remote';
  } else if (
    normalizedLoc.includes('china') ||
    normalizedLoc.includes('beijing') ||
    normalizedLoc.includes('shanghai') ||
    normalizedLoc.includes('shenzhen') ||
    normalizedLoc.includes('hangzhou') ||
    normalizedLoc.includes('guangzhou') ||
    normalizedLoc.includes('chengdu') ||
    normalizedLoc.includes('hong kong') ||
    normalizedLoc.includes('中国') ||
    normalizedLoc.includes('北京') ||
    normalizedLoc.includes('上海') ||
    normalizedLoc.includes('深圳')
  ) {
    region = 'China';
  } else if (
    normalizedLoc.includes('us') ||
    normalizedLoc.includes('usa') ||
    normalizedLoc.includes('united states') ||
    normalizedLoc.includes('canada') ||
    normalizedLoc.includes('seattle') ||
    normalizedLoc.includes('san francisco') ||
    normalizedLoc.includes('bay area') ||
    normalizedLoc.includes('new york') ||
    normalizedLoc.includes('sunnyvale') ||
    normalizedLoc.includes('austin') ||
    normalizedLoc.includes('toronto') ||
    normalizedLoc.includes('vancouver') ||
    normalizedLoc.includes('boston') ||
    normalizedLoc.includes('chicago') ||
    normalizedLoc.includes('los angeles')
  ) {
    region = 'North America';
  }

  // 3. 深度校招 (New Grad) 与实习 (Intern) 全方位识别
  let jobType: 'Full-time' | 'Intern' | 'New Grad' | 'Contract' | 'Part-time' = 'Full-time';

  const isInternship = (
    normalizedTitle.includes('intern') ||
    normalizedTitle.includes('internship') ||
    normalizedTitle.includes('co-op') ||
    normalizedTitle.includes('coop') ||
    normalizedTitle.includes('summer 202') ||
    normalizedTitle.includes('fall 202') ||
    normalizedTitle.includes('spring 202') ||
    normalizedTitle.includes('trainee') ||
    normalizedTitle.includes('fellowship') ||
    normalizedTitle.includes('实习') ||
    normalizedDept.includes('intern') ||
    normalizedDept.includes('student') ||
    descSnippet.includes('currently pursuing a degree') ||
    descSnippet.includes('returning to school after') ||
    descSnippet.includes('must be currently enrolled')
  );

  const isNewGrad = !isInternship && (
    normalizedTitle.includes('new grad') ||
    normalizedTitle.includes('new-grad') ||
    normalizedTitle.includes('university grad') ||
    normalizedTitle.includes('early career') ||
    normalizedTitle.includes('early-career') ||
    normalizedTitle.includes('campus') ||
    normalizedTitle.includes('college grad') ||
    normalizedTitle.includes('entry level') ||
    normalizedTitle.includes('entry-level') ||
    normalizedTitle.includes('rotational') ||
    normalizedTitle.includes('apprentice') ||
    normalizedTitle.includes('graduate program') ||
    normalizedTitle.includes('graduate engineer') ||
    normalizedTitle.includes('associate software') ||
    normalizedTitle.includes('2025 grad') ||
    normalizedTitle.includes('2026 grad') ||
    normalizedTitle.includes('2025 start') ||
    normalizedTitle.includes('2026 start') ||
    normalizedTitle.includes('class of 2025') ||
    normalizedTitle.includes('class of 2026') ||
    normalizedTitle.includes('应届') ||
    normalizedTitle.includes('校招') ||
    normalizedDept.includes('university') ||
    normalizedDept.includes('campus') ||
    normalizedDept.includes('early career') ||
    descSnippet.includes('graduating between') ||
    descSnippet.includes('degree completed between') ||
    descSnippet.includes('graduating in 2025') ||
    descSnippet.includes('graduating in 2026')
  );

  if (isInternship) {
    jobType = 'Intern';
  } else if (isNewGrad) {
    jobType = 'New Grad';
  } else if (normalizedTitle.includes('contract') || normalizedTitle.includes('contractor')) {
    jobType = 'Contract';
  } else if (normalizedTitle.includes('part-time') || normalizedTitle.includes('part time')) {
    jobType = 'Part-time';
  }

  // 4. 级别判定
  let level = 'Mid';
  if (jobType === 'Intern') {
    level = 'Intern';
  } else if (jobType === 'New Grad') {
    level = 'Entry/Junior';
  } else if (
    normalizedTitle.includes('junior') ||
    normalizedTitle.includes('associate') ||
    normalizedTitle.includes('level 1') ||
    normalizedTitle.includes(' l1') ||
    normalizedTitle.includes(' l2') ||
    normalizedTitle.includes('sde i ') ||
    normalizedTitle.includes('sde 1')
  ) {
    level = 'Entry/Junior';
  } else if (
    normalizedTitle.includes('staff') ||
    normalizedTitle.includes('principal') ||
    normalizedTitle.includes('distinguished') ||
    normalizedTitle.includes('fellow')
  ) {
    level = 'Staff/Principal';
  } else if (
    normalizedTitle.includes('senior') ||
    normalizedTitle.includes('sr.') ||
    normalizedTitle.includes('sr ') ||
    normalizedTitle.includes('sde iii') ||
    normalizedTitle.includes('sde 3') ||
    normalizedTitle.includes('level 5')
  ) {
    level = 'Senior';
  } else if (
    normalizedTitle.includes('lead') ||
    normalizedTitle.includes('manager') ||
    normalizedTitle.includes('director') ||
    normalizedTitle.includes('head of')
  ) {
    level = 'Lead/Mgr';
  }

  // 5. 技术方向
  let track = 'Fullstack';

  if (
    normalizedTitle.includes('machine learning') ||
    normalizedTitle.includes('ml ') ||
    normalizedTitle.includes('ml engineer') ||
    normalizedTitle.includes('deep learning') ||
    normalizedTitle.includes('ai ') ||
    normalizedTitle.includes('ai engineer') ||
    normalizedTitle.includes('artificial intelligence') ||
    normalizedTitle.includes('research scientist') ||
    normalizedTitle.includes('applied scientist') ||
    normalizedTitle.includes('llm') ||
    normalizedTitle.includes('nlp') ||
    normalizedTitle.includes('computer vision') ||
    normalizedTitle.includes('data scientist') ||
    normalizedTitle.includes('ai support')
  ) {
    track = 'AI/ML';
  } else if (
    normalizedTitle.includes('frontend') ||
    normalizedTitle.includes('front-end') ||
    normalizedTitle.includes('front end') ||
    normalizedTitle.includes('ui engineer') ||
    normalizedTitle.includes('web developer')
  ) {
    track = 'Frontend';
  } else if (
    normalizedTitle.includes('backend') ||
    normalizedTitle.includes('back-end') ||
    normalizedTitle.includes('back end') ||
    normalizedTitle.includes('server') ||
    normalizedTitle.includes('distributed systems') ||
    normalizedTitle.includes('api engineer')
  ) {
    track = 'Backend';
  } else if (
    normalizedTitle.includes('data engineer') ||
    normalizedTitle.includes('data platform') ||
    normalizedTitle.includes('analytics engineer') ||
    normalizedTitle.includes('big data') ||
    normalizedTitle.includes('database')
  ) {
    track = 'Data';
  } else if (
    normalizedTitle.includes('devops') ||
    normalizedTitle.includes('sre') ||
    normalizedTitle.includes('site reliability') ||
    normalizedTitle.includes('infrastructure') ||
    normalizedTitle.includes('infra') ||
    normalizedTitle.includes('cloud') ||
    normalizedTitle.includes('platform engineer') ||
    normalizedTitle.includes('systems engineer') ||
    normalizedTitle.includes('solutions architect')
  ) {
    track = 'DevOps';
  } else if (
    normalizedTitle.includes('mobile') ||
    normalizedTitle.includes('ios') ||
    normalizedTitle.includes('android') ||
    normalizedTitle.includes('swift') ||
    normalizedTitle.includes('flutter')
  ) {
    track = 'Mobile';
  } else if (
    normalizedTitle.includes('security') ||
    normalizedTitle.includes('infosec') ||
    normalizedTitle.includes('application security') ||
    normalizedTitle.includes('cyber')
  ) {
    track = 'Security';
  } else if (
    normalizedTitle.includes('embedded') ||
    normalizedTitle.includes('firmware') ||
    normalizedTitle.includes('hardware') ||
    normalizedTitle.includes('iot') ||
    normalizedTitle.includes('robotics')
  ) {
    track = 'Embedded';
  } else if (
    normalizedTitle.includes('fullstack') ||
    normalizedTitle.includes('full-stack') ||
    normalizedTitle.includes('full stack') ||
    normalizedTitle.includes('software engineer') ||
    normalizedTitle.includes('sde') ||
    normalizedTitle.includes('developer') ||
    normalizedTitle.includes('technical staff')
  ) {
    track = 'Fullstack';
  }

  const tags: string[] = [];
  for (const tag of COMMON_TECH_TAGS) {
    if (matchTechTag(combinedText, tag)) {
      tags.push(tag);
      if (tags.length >= 4) break;
    }
  }

  if (tags.length === 0 && isTech) {
    tags.push(track);
    if (isRemote) tags.push('Remote');
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
// lib/jobs/ai-parser.ts

/**
 * AI Job Parser Service
 * 
 * 核心职责：
 * 接收已由 Collector 抓取完成的 JD 与元数据，利用 LLM 进行高精度的结构化信息提取。
 * 绝不猜测不存在的信息，严格遵循 JSON 输出规范，并内置确定性 Fallback 机制。
 */

export interface AiJobParseInput {
  title: string;
  description: string;
  location: string;
  company: string;
  requirements?: string;
}

export interface AiJobParseOutput {
  jobLevel: string;
  employmentType: string;
  track: string;
  skills: string[];
  yearsOfExperience: number | null;
  education: string;
  visaSponsorship: 'YES' | 'NO' | 'UNKNOWN';
  remote: 'YES' | 'NO' | 'HYBRID' | 'UNKNOWN';
  newGrad: boolean;
  internship: boolean;
}

/**
 * 结构化 Prompt 模板
 */
function buildPrompt(input: AiJobParseInput): string {
  return `You are an expert technical recruiting analyst. Your task is to analyze the following Job Description (JD) and extract structured metadata.

=== JOB INFORMATION ===
Company: ${input.company}
Title: ${input.title}
Location: ${input.location}
Description:
${input.description.slice(0, 4000)}${input.requirements ? `\nRequirements:\n${input.requirements.slice(0, 2000)}` : ''}

=== EXTRACTION RULES ===
1. DO NOT guess or hallucinate nonexistent information. If not clearly mentioned, return "UNKNOWN" or null.
2. visaSponsorship: 
   - "YES" ONLY if the JD explicitly states that visa sponsorship / H1B is available or supported.
   - "NO" ONLY if the JD explicitly states no visa sponsorship, or requires US Citizenship / Permanent Residency (Green Card) without exception.
   - "UNKNOWN" if visa sponsorship is not explicitly mentioned. (DO NOT assume US companies support visa).
3. remote:
   - "YES" if 100% remote / work from anywhere.
   - "HYBRID" if partial onsite (e.g. 2-3 days in office).
   - "NO" if strictly onsite.
   - "UNKNOWN" if not specified.
4. track: Must be one of ["Backend", "Frontend", "Fullstack", "AI/ML", "Data", "DevOps", "Mobile", "Security", "Embedded", "Other"]. Base your judgment on the actual responsibilities and tech stack, NOT just the word "Engineer".
5. jobLevel: One of ["Intern", "New Grad", "Junior/Entry", "Mid-level", "Senior", "Staff", "Principal", "Lead/Manager", "UNKNOWN"].
6. yearsOfExperience: Minimum years of required professional experience as an integer (e.g., 3, 5). If none or not explicitly mentioned, return null. (Do not guess).
7. skills: Array of strings. ONLY extract technologies, programming languages, and tools explicitly mentioned in the JD (e.g., ["Python", "PyTorch", "Kubernetes", "PostgreSQL"]).
8. newGrad: boolean (true if targeted at recent graduates / university graduates / campus hiring, else false).
9. internship: boolean (true if intern / co-op position, else false).

=== OUTPUT FORMAT ===
You MUST return ONLY a valid, raw JSON object matching this exact schema without any markdown formatting (no \`\`\`json wrappers):
{
  "jobLevel": "string",
  "employmentType": "Full-time | Intern | Contract | Part-time | UNKNOWN",
  "track": "Backend | Frontend | Fullstack | AI/ML | Data | DevOps | Mobile | Security | Embedded | Other",
  "skills": ["string"],
  "yearsOfExperience": number or null,
  "education": "Bachelor's | Master's | PhD | High School | UNKNOWN",
  "visaSponsorship": "YES | NO | UNKNOWN",
  "remote": "YES | NO | HYBRID | UNKNOWN",
  "newGrad": boolean,
  "internship": boolean
}`;
}

/**
 * 健壮的 JSON 解析与清理器
 */
function cleanAndParseJson(rawText: string): AiJobParseOutput | null {
  try {
    let clean = rawText.trim();
    // 清除可能存在的 markdown 代码块包裹 (```json ... ```)
    if (clean.startsWith('```')) {
      clean = clean.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }
    const parsed = JSON.parse(clean);

    // 验证核心字段并做类型安全清洗
    return {
      jobLevel: typeof parsed.jobLevel === 'string' ? parsed.jobLevel : 'UNKNOWN',
      employmentType: typeof parsed.employmentType === 'string' ? parsed.employmentType : 'UNKNOWN',
      track: typeof parsed.track === 'string' ? parsed.track : 'Fullstack',
      skills: Array.isArray(parsed.skills) ? parsed.skills.map(String).slice(0, 15) : [],
      yearsOfExperience: typeof parsed.yearsOfExperience === 'number' ? parsed.yearsOfExperience : null,
      education: typeof parsed.education === 'string' ? parsed.education : 'UNKNOWN',
      visaSponsorship: ['YES', 'NO', 'UNKNOWN'].includes(parsed.visaSponsorship) ? parsed.visaSponsorship : 'UNKNOWN',
      remote: ['YES', 'NO', 'HYBRID', 'UNKNOWN'].includes(parsed.remote) ? parsed.remote : 'UNKNOWN',
      newGrad: Boolean(parsed.newGrad),
      internship: Boolean(parsed.internship),
    };
  } catch (err) {
    console.warn('[AI Job Parser] Failed to parse model output as JSON:', err);
    return null;
  }
}

/**
 * 确定性规则引擎 Fallback (当 LLM API 故障、未配置密钥或输出非法格式时代偿)
 */
export function ruleBasedFallback(input: AiJobParseInput): AiJobParseOutput {
  const combined = `${input.title} ${input.location} ${input.description}`.toLowerCase();

  // 1. 实习与校招判定
  const internship = combined.includes('intern') || combined.includes('internship') || combined.includes('co-op') || combined.includes('实习');
  const newGrad = !internship && (
    combined.includes('new grad') ||
    combined.includes('university grad') ||
    combined.includes('early career') ||
    combined.includes('campus') ||
    combined.includes('2025 grad') ||
    combined.includes('2026 grad') ||
    combined.includes('应届') ||
    combined.includes('校招')
  );

  // 2. 职位级别
  let jobLevel = 'Mid-level';
  if (internship) jobLevel = 'Intern';
  else if (newGrad) jobLevel = 'New Grad';
  else if (combined.includes('senior') || combined.includes('sr.') || combined.includes('sde iii')) jobLevel = 'Senior';
  else if (combined.includes('staff') || combined.includes('principal')) jobLevel = 'Staff';
  else if (combined.includes('junior') || combined.includes('entry level') || combined.includes('associate')) jobLevel = 'Junior/Entry';

  // 3. 技术方向
  let track = 'Fullstack';
  if (combined.includes('machine learning') || combined.includes('ai ') || combined.includes('deep learning') || combined.includes('llm') || combined.includes('nlp')) {
    track = 'AI/ML';
  } else if (combined.includes('frontend') || combined.includes('front-end') || combined.includes('ui engineer')) {
    track = 'Frontend';
  } else if (combined.includes('backend') || combined.includes('back-end') || combined.includes('server') || combined.includes('distributed')) {
    track = 'Backend';
  } else if (combined.includes('data engineer') || combined.includes('data platform') || combined.includes('analytics')) {
    track = 'Data';
  } else if (combined.includes('devops') || combined.includes('sre') || combined.includes('infrastructure') || combined.includes('infra')) {
    track = 'DevOps';
  } else if (combined.includes('mobile') || combined.includes('ios') || combined.includes('android')) {
    track = 'Mobile';
  } else if (combined.includes('security') || combined.includes('infosec')) {
    track = 'Security';
  } else if (combined.includes('embedded') || combined.includes('firmware') || combined.includes('hardware')) {
    track = 'Embedded';
  }

  // 4. 工作性质
  let employmentType = 'Full-time';
  if (internship) employmentType = 'Intern';
  else if (combined.includes('contract') || combined.includes('contractor')) employmentType = 'Contract';

  // 5. 远程判断
  let remote: 'YES' | 'NO' | 'HYBRID' | 'UNKNOWN' = 'UNKNOWN';
  if (combined.includes('remote') || combined.includes('virtual') || combined.includes('work from home')) {
    remote = 'YES';
  } else if (combined.includes('hybrid')) {
    remote = 'HYBRID';
  }

  // 6. 签证支持判定
  let visaSponsorship: 'YES' | 'NO' | 'UNKNOWN' = 'UNKNOWN';
  if (combined.includes('visa sponsorship available') || combined.includes('will sponsor') || combined.includes('h-1b sponsorship available')) {
    visaSponsorship = 'YES';
  } else if (combined.includes('no sponsorship') || combined.includes('must be a us citizen') || combined.includes('without sponsorship') || combined.includes('will not sponsor')) {
    visaSponsorship = 'NO';
  }

  // 7. 工作经验提取 (提取如 "3+ years", "5 years")
  let yearsOfExperience: number | null = null;
  const yoeMatch = combined.match(/(\d+)\+?\s*(?:years|yrs)\s+(?:of\s+)?experience/i);
  if (yoeMatch) {
    const parsedYoe = parseInt(yoeMatch[1], 10);
    if (parsedYoe >= 1 && parsedYoe <= 20) {
      yearsOfExperience = parsedYoe;
    }
  }

  // 8. 核心技术栈提取
  const COMMON_SKILLS = [
    'Python', 'Java', 'Go', 'C++', 'Rust', 'TypeScript', 'JavaScript',
    'React', 'Next.js', 'PyTorch', 'TensorFlow', 'Kubernetes', 'Docker',
    'AWS', 'GCP', 'PostgreSQL', 'Redis', 'Kafka', 'SQL'
  ];
  const skills = COMMON_SKILLS.filter((s) => combined.includes(s.toLowerCase()));

  return {
    jobLevel,
    employmentType,
    track,
    skills,
    yearsOfExperience,
    education: combined.includes('phd') ? 'PhD' : combined.includes('master') ? "Master's" : combined.includes('bachelor') ? "Bachelor's" : 'UNKNOWN',
    visaSponsorship,
    remote,
    newGrad,
    internship,
  };
}

/**
 * AI Job Parser 主服务入口
 * 优先调用 LLM 生成高精度结构化数据，遇任何异常或超时自动无缝降级到 Fallback 规则引擎
 */
export async function parseJobWithAI(input: AiJobParseInput): Promise<AiJobParseOutput> {
  const apiKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;
  const apiBase = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';

  // 未配置 API Key 时直接走确定性 Fallback 引擎
  if (!apiKey) {
    return ruleBasedFallback(input);
  }

  try {
    const prompt = buildPrompt(input);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 秒超时防护

    const response = await fetch(`${apiBase}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.AI_PARSER_MODEL || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a precise technical hiring metadata extractor. Return strictly valid JSON adhering to the given schema.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1, // 低温严格防止发散与幻觉
        max_tokens: 800,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[AI Job Parser] LLM API returned ${response.status}. Using fallback.`);
      return ruleBasedFallback(input);
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content;

    if (!rawContent) {
      return ruleBasedFallback(input);
    }

    const parsedResult = cleanAndParseJson(rawContent);
    if (!parsedResult) {
      return ruleBasedFallback(input);
    }

    return parsedResult;
  } catch (error) {
    console.warn('[AI Job Parser] Error calling LLM, using fallback:', error);
    return ruleBasedFallback(input);
  }
}
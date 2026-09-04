// lib/jobs/target-classifier.ts

/**
 * Target job classification used by the public jobs/radar system.
 *
 * Target jobs:
 *   - Intern
 *   - New Grad
 *
 * Non-target:
 *   - Experienced
 *
 * IMPORTANT:
 * This classifier is intentionally conservative.
 * When there is not enough reliable evidence that a job is
 * an internship or new-grad role, it is treated as Experienced.
 */

export type TargetJobType = 'Intern' | 'New Grad' | 'Experienced';

export interface TargetClassification {
  type: TargetJobType;
  isTarget: boolean;
  confidence: 'high' | 'medium' | 'low';
  evidence: string[];
}

/**
 * ---------------------------------------------------------------------------
 * Regex helpers
 * ---------------------------------------------------------------------------
 *
 * Keep every regex on a single line.
 *
 * JavaScript / TypeScript regex literals cannot contain ordinary
 * unescaped line breaks.
 */

/**
 * Internship / student title keywords.
 */
const INTERN_TITLE_REGEX =
  /\b(?:intern|internship|co-?op|coop|trainee|apprentice|fellowship|summer\s+(?:intern|associate)|student\s+intern)\b|实习|实习生/i;

/**
 * New graduate / early career title keywords.
 */
const NEW_GRAD_TITLE_REGEX =
  /\b(?:new\s+grad(?:uate)?|university\s+grad(?:uate)?|college\s+grad(?:uate)?|campus(?:\s+hire)?|early\s+career|entry[-\s]?level|fresh\s+grad(?:uate)?|graduate\s+program|graduate\s+engineer|rotational\s+program|associate\s+(?:software\s+)?engineer|junior\s+(?:software\s+)?engineer|sde\s+i|swe\s+i|software\s+engineer\s+i|class\s+of\s+20(?:2[4-9])|20(?:2[4-9])\s+(?:grad|graduate|start)|bs\/ms)\b|校招|应届|应届生|校园招聘/i;

/**
 * Explicit experienced-level keywords.
 *
 * These take priority over generic new-grad keywords.
 */
const EXPLICIT_EXPERIENCED_REGEX =
  /\b(?:senior|sr\.?|staff|principal|lead|manager|director|vice\s+president|vp|architect|distinguished|expert|partner|sde\s+(?:ii|iii|iv|2|3|4)|swe\s+(?:ii|iii|iv|2|3|4))\b/i;

/**
 * Internship/student evidence in job description.
 */
const INTERN_DESCRIPTION_REGEX =
  /\b(?:currently\s+enrolled|currently\s+pursuing\s+(?:a\s+)?(?:bachelor|master|phd|degree)|returning\s+to\s+school|internship|intern|co-?op|student\s+program)\b/i;

/**
 * New-grad / early-career evidence in job description.
 */
const NEW_GRAD_DESCRIPTION_REGEX =
  /\b(?:graduating\s+in\s+20(?:2[4-9])|graduating\s+between|recent\s+graduate|new\s+graduate|new\s+grad|degree\s+completed\s+between|entry[-\s]?level|early\s+career|campus\s+hire)\b/i;

/**
 * Experienced-level keywords for department / level fields.
 */
const EXPERIENCED_LEVEL_REGEX =
  /\b(?:senior|sr\.?|staff|principal|lead|manager|director|vp|vice\s+president|architect|distinguished|expert|partner)\b/i;

/**
 * Internship keywords for department / level fields.
 */
const INTERN_LEVEL_REGEX =
  /\b(?:intern|internship|student|co-?op|coop|trainee|apprentice)\b/i;

/**
 * New-grad keywords for department / level fields.
 */
const NEW_GRAD_LEVEL_REGEX =
  /\b(?:new\s+grad|new\s+graduate|early\s+career|campus|university|college|graduate|entry[-\s]?level|rotational)\b/i;

/**
 * ---------------------------------------------------------------------------
 * Normalization
 * ---------------------------------------------------------------------------
 */

function normalize(value?: string): string {
  return (value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normalize ATS employmentType values.
 *
 * Examples:
 *   "Intern"      -> "intern"
 *   "Internship"  -> "internship"
 *   "Co-op"       -> "coop"
 *   "co op"       -> "coop"
 */
function normalizedEmploymentType(value?: string): string {
  return normalize(value)
    .toLowerCase()
    .replace(/[-_\s]/g, '');
}

/**
 * ---------------------------------------------------------------------------
 * Classification
 * ---------------------------------------------------------------------------
 */

export function classifyTargetJob(params: {
  title: string;
  description?: string;
  department?: string;
  employmentType?: string;
  level?: string;
}): TargetClassification {
  const title = normalize(params.title);
  const description = normalize(params.description).slice(0, 6000);
  const department = normalize(params.department);
  const employmentType = normalizedEmploymentType(params.employmentType);
  const level = normalize(params.level);

  const evidence: string[] = [];

  /**
   * Empty title should never be classified as a target job.
   */
  if (!title) {
    return {
      type: 'Experienced',
      isTarget: false,
      confidence: 'low',
      evidence: ['missing job title'],
    };
  }

  /**
   * -------------------------------------------------------------------------
   * 1. Explicit experienced title
   * -------------------------------------------------------------------------
   *
   * Senior / Staff / Principal etc. must never accidentally become
   * New Grad because the description contains "graduate" or "early career".
   *
   * However, internship is checked before this because titles such as:
   *
   *   "Software Engineer Intern"
   *
   * are clearly internships.
   */

  /**
   * -------------------------------------------------------------------------
   * 2. Official ATS employmentType
   * -------------------------------------------------------------------------
   *
   * Official structured data is stronger than text heuristics.
   */

  if (
    employmentType === 'intern' ||
    employmentType === 'internship' ||
    employmentType === 'coop'
  ) {
    evidence.push(
      `official employmentType=${params.employmentType || 'unknown'}`
    );

    return {
      type: 'Intern',
      isTarget: true,
      confidence: 'high',
      evidence,
    };
  }

  /**
   * -------------------------------------------------------------------------
   * 3. Internship title
   * -------------------------------------------------------------------------
   */

  if (INTERN_TITLE_REGEX.test(title)) {
    evidence.push('internship keyword in title');

    return {
      type: 'Intern',
      isTarget: true,
      confidence: 'high',
      evidence,
    };
  }

  /**
   * -------------------------------------------------------------------------
   * 4. Explicit experienced title
   * -------------------------------------------------------------------------
   */

  if (EXPLICIT_EXPERIENCED_REGEX.test(title)) {
    evidence.push('experienced-level keyword in title');

    return {
      type: 'Experienced',
      isTarget: false,
      confidence: 'high',
      evidence,
    };
  }

  /**
   * -------------------------------------------------------------------------
   * 5. New Grad title
   * -------------------------------------------------------------------------
   */

  if (NEW_GRAD_TITLE_REGEX.test(title)) {
    evidence.push('new-grad keyword in title');

    return {
      type: 'New Grad',
      isTarget: true,
      confidence: 'high',
      evidence,
    };
  }

  /**
   * -------------------------------------------------------------------------
   * 6. Department / level
   * -------------------------------------------------------------------------
   */

  const deptText = `${department} ${level}`.trim();

  /**
   * Experienced-level evidence always wins over generic student/graduate
   * keywords in department / level fields.
   */
  if (deptText && EXPERIENCED_LEVEL_REGEX.test(deptText)) {
    evidence.push('experienced-level keyword in department or level');

    return {
      type: 'Experienced',
      isTarget: false,
      confidence: 'high',
      evidence,
    };
  }

  /**
   * Internship department / level.
   */
  if (deptText && INTERN_LEVEL_REGEX.test(deptText)) {
    evidence.push('student/intern keyword in department or level');

    return {
      type: 'Intern',
      isTarget: true,
      confidence: 'medium',
      evidence,
    };
  }

  /**
   * New-grad / early-career department / level.
   */
  if (deptText && NEW_GRAD_LEVEL_REGEX.test(deptText)) {
    evidence.push(
      'new-grad/early-career keyword in department or level'
    );

    return {
      type: 'New Grad',
      isTarget: true,
      confidence: 'medium',
      evidence,
    };
  }

  /**
   * -------------------------------------------------------------------------
   * 7. Description fallback
   * -------------------------------------------------------------------------
   *
   * Description evidence is weaker than title / structured ATS data.
   */

  if (INTERN_DESCRIPTION_REGEX.test(description)) {
    evidence.push('internship/student language in description');

    return {
      type: 'Intern',
      isTarget: true,
      confidence: 'medium',
      evidence,
    };
  }

  if (NEW_GRAD_DESCRIPTION_REGEX.test(description)) {
    evidence.push('new-grad language in description');

    return {
      type: 'New Grad',
      isTarget: true,
      confidence: 'medium',
      evidence,
    };
  }

  /**
   * -------------------------------------------------------------------------
   * 8. Default
   * -------------------------------------------------------------------------
   *
   * Conservative behavior:
   *
   * No reliable evidence of Intern / New Grad
   * =>
   * Experienced / non-target.
   */

  return {
    type: 'Experienced',
    isTarget: false,
    confidence: 'high',
    evidence: ['no reliable NG/Intern evidence'],
  };
}

/**
 * ---------------------------------------------------------------------------
 * Boolean helper
 * ---------------------------------------------------------------------------
 */

export function isTargetJob(params: {
  title: string;
  description?: string;
  department?: string;
  employmentType?: string;
  level?: string;
}): boolean {
  return classifyTargetJob(params).isTarget;
}
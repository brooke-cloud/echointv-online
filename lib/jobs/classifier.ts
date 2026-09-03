// lib/jobs/classifier.ts

export type JobLevelType =
  | 'Intern (BS/MS)'
  | 'Intern (PhD)'
  | 'Intern'
  | 'New Grad (BS/MS)'
  | 'New Grad (PhD)'
  | 'Early Career'
  | 'Experienced';

// 1. 强排除词（命中即视为社招/高级岗位）
const EXCLUDE_TITLE_REGEX =
  /\b(senior|sr\.?|staff|principal|lead|head|manager|director|vp|architect|distinguished|expert|partner)\b|\b(sde|swe)\s*(ii|iii|iv|2|3|4)\b/i;

// 2. 实习关键词
const INTERN_REGEX =
  /\b(intern|internship|co-?op|trainee|apprentice|fellowship|summer\s*associate|stagiaire|实习|实习生)\b/i;

// 3. 校招应届关键词
const NEW_GRAD_REGEX =
  /\b(new\s*grad(uate)?|university\s*grad(uate)?|college\s*grad(uate)?|campus(\s*hire)?|early\s*career|entry\s*level|entry-level|fresh\s*grad(uate)?|graduate\s*program|rotational|sde\s*i\b|swe\s*i\b|software\s*engineer\s*i\b|associate\s*engineer|junior|校招|应届(生)?|校园招聘)\b/i;

// 4. 毕业年份与学制特征（常见于大厂标题后缀）
const GRAD_SEASON_REGEX =
  /\b(202[4-7]\s*(start|grad(uate)?|class)|class\s*of\s*202[4-7]|bs\/ms|bachelor'?s\/master'?s)\b/i;

const PHD_REGEX = /\b(phd|ph\.d|doctorate|doctoral|research\s*scientist)\b/i;

export interface ClassificationResult {
  isTarget: boolean; // 是否属于 NG 或 Intern
  category: 'NG' | 'INTERN' | 'OTHER';
  level: JobLevelType;
}

/**
 * 核心分类器：根据 Title 和 Description 精准识别
 */
export function classifyJobLevel(title: string, description: string = ''): ClassificationResult {
  const cleanTitle = title.trim();

  // 第一步：负向拦截（标题出现 Senior/Staff/Manager 等直接排除）
  if (EXCLUDE_TITLE_REGEX.test(cleanTitle)) {
    return { isTarget: false, category: 'OTHER', level: 'Experienced' };
  }

  const isPhd = PHD_REGEX.test(cleanTitle) || PHD_REGEX.test(description.slice(0, 500));

  // 第二步：优先判定实习（Intern 语义优先级最高，避免出现 "Internship for New Grads" 被误判）
  if (INTERN_REGEX.test(cleanTitle)) {
    return {
      isTarget: true,
      category: 'INTERN',
      level: isPhd ? 'Intern (PhD)' : 'Intern (BS/MS)',
    };
  }

  // 第三步：判定校招（New Grad / Early Career / 毕业年份）
  if (NEW_GRAD_REGEX.test(cleanTitle) || GRAD_SEASON_REGEX.test(cleanTitle)) {
    if (isPhd) {
      return { isTarget: true, category: 'NG', level: 'New Grad (PhD)' };
    }
    if (/\b(early\s*career|associate)\b/i.test(cleanTitle)) {
      return { isTarget: true, category: 'NG', level: 'Early Career' };
    }
    return { isTarget: true, category: 'NG', level: 'New Grad (BS/MS)' };
  }

  // 第四步：若标题较隐晦，检查描述首段（限前 300 字符，防止深层内容干扰）
  const descPrefix = description.slice(0, 300);
  if (INTERN_REGEX.test(descPrefix)) {
    return { isTarget: true, category: 'INTERN', level: 'Intern' };
  }
  if (NEW_GRAD_REGEX.test(descPrefix) || GRAD_SEASON_REGEX.test(descPrefix)) {
    return { isTarget: true, category: 'NG', level: 'New Grad (BS/MS)' };
  }

  return { isTarget: false, category: 'OTHER', level: 'Experienced' };
}
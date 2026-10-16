import type { NotionContentBlock, NotionInterviewSource } from '@/lib/notion-interviews';
import {
  normalizeInterviewImportPayload,
  type ImportExample,
  type ImportParameter,
  type InterviewImportPayload,
} from '@/lib/interview-import-schema';

type Section =
  | 'title' | 'company' | 'role' | 'difficulty' | 'stage' | 'category' | 'topics'
  | 'problem' | 'example' | 'function' | 'constraints'
  | 'approach' | 'coreIdea' | 'algorithmSteps' | 'whyWorks' | 'edgeCases'
  | 'solution' | 'pythonSolution' | 'javaSolution' | 'cppSolution'
  | 'complexity' | 'timeComplexity' | 'spaceComplexity'
  | 'analysis' | 'interviewIntent' | 'keyConcepts' | 'commonMistakes' | 'followUpQuestions' | 'betterStrategy'
  | 'unknown';

const aliases: Record<Exclude<Section, 'unknown'>, string[]> = {
  title: ['title', 'question title', '标题', '题目标题'],
  company: ['company', '公司'],
  role: ['role', 'position', '职位', '岗位'],
  difficulty: ['difficulty', '难度'],
  stage: ['stage', 'interview type', '面试类型', '面试阶段'],
  category: ['category', 'categories', '分类', '题型'],
  topics: ['topic', 'topics', 'tags', '知识点', '标签'],
  problem: ['problem description', 'problem', 'description', '题目描述', '题目', '问题描述'],
  example: ['example', 'examples', 'sample', 'samples', '示例', '样例', '输入输出示例'],
  function: ['function description', 'function', '函数描述', '函数定义'],
  constraints: ['constraints', 'constraint', '限制', '约束', '限制条件'],
  approach: ['approach', 'solution approach', '思路', '解题思路'],
  coreIdea: ['core idea', 'how to think', '核心思路', '如何思考'],
  algorithmSteps: ['algorithm steps', 'step-by-step approach', 'steps', '算法步骤', '解题步骤', '步骤'],
  whyWorks: ['why this works', 'why it works', 'correctness', '正确性', '为什么可行'],
  edgeCases: ['edge cases', 'edge case', '边界情况', '特殊情况'],
  solution: ['solution', 'code', 'reference solution', '代码', '参考代码', '解法'],
  pythonSolution: ['python solution', 'python code', 'python 解法', 'python 代码'],
  javaSolution: ['java solution', 'java code', 'java 解法', 'java 代码'],
  cppSolution: ['c++ solution', 'cpp solution', 'c++ code', 'cpp code', 'c++ 解法', 'cpp 解法'],
  complexity: ['complexity', '复杂度'],
  timeComplexity: ['time complexity', '时间复杂度'],
  spaceComplexity: ['space complexity', '空间复杂度'],
  analysis: ['ai analysis', 'interview analysis', 'ai 分析', '面试分析', '面试复盘'],
  interviewIntent: ['interview intent', 'interviewer intent', 'interview focus', 'what interviewer is testing', '面试官意图', '考察意图', '面试重点'],
  keyConcepts: ['key concepts', '关键概念', '核心知识点'],
  commonMistakes: ['common mistakes', '常见错误'],
  followUpQuestions: ['follow up', 'follow-up', 'follow up questions', 'follow-up questions', '追问', '追问问题'],
  betterStrategy: ['better strategy', 'better answer strategy', '改进策略', '更好的回答策略'],
};

function normalizedHeading(value: string) {
  return value.toLowerCase().replace(/[`*_#]/g, '').replace(/[：:]+$/, '').replace(/\s+/g, ' ').trim();
}

function sectionFor(value: string): Section {
  const normalized = normalizedHeading(value);
  for (const [section, values] of Object.entries(aliases) as Array<[Exclude<Section, 'unknown'>, string[]]>) {
    if (values.some((alias) => normalized === normalizedHeading(alias))) return section;
  }
  return 'unknown';
}

function inlineSection(value: string): { section: Section; content: string } | null {
  const match = value.match(/^\s*([^:：]{1,60})\s*[:：]\s*([\s\S]*)$/);
  if (!match) return null;
  const section = sectionFor(match[1]);
  return section === 'unknown' ? null : { section, content: match[2].trim() };
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function labelled(text: string, labels: string[]) {
  for (const label of labels) {
    const pattern = new RegExp(`(?:^|\\n)\\s*(?:${escapeRegExp(label)})\\s*[:：]\\s*([\\s\\S]*?)(?=\\n\\s*[A-Za-z\\u4e00-\\u9fff][^\\n:：]{0,50}[:：]|$)`, 'i');
    const match = text.match(pattern);
    if (match?.[1]?.trim()) return match[1].trim();
  }
  return '';
}

function splitList(text: string) {
  return text.split(/\r?\n|[,;，；]/).map((line) => line.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, '').trim()).filter(Boolean);
}

function splitLines(text: string) {
  return text.split(/\r?\n/).map((line) => line.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, '').trim()).filter(Boolean);
}

function parseExamples(text: string): ImportExample[] {
  if (!text.trim()) return [];
  const chunks = text.split(/(?=\bExample\s*\d*\s*[:：]?|示例\s*\d*\s*[:：]?)/i).map((item) => item.trim()).filter(Boolean);
  const source = chunks.length > 1 ? chunks : [text];
  return source.map((chunk) => ({
    input: labelled(chunk, ['Input', '输入']),
    output: labelled(chunk, ['Output', '输出']),
    explanation: labelled(chunk, ['Explanation', '解释', '说明']),
  })).filter((item) => item.input || item.output || item.explanation);
}

function parseParameters(text: string): ImportParameter[] {
  const parameterSection = text.match(/(?:^|\n)\s*(?:Parameters?|参数)\s*[:：]?\s*\n?([\s\S]*?)(?=\n\s*(?:Return Description|Returns?|返回描述|返回值|返回)\s*[:：]?|$)/i);
  const parameterText = parameterSection?.[1]?.trim() || labelled(text, ['Parameters', 'Parameter', '参数']);
  if (!parameterText) return [];
  return parameterText.split(/\r?\n/).map((line) => line.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, '').trim()).filter(Boolean).map((line) => {
    const pipe = line.split('|').map((item) => item.trim());
    if (pipe.length >= 3) return { name: pipe[0], type: pipe[1], description: pipe.slice(2).join(' | ') };
    const detailed = line.match(/^([^:：]+)\s*[:：]\s*(.+?)\s+(?:-|—|–)\s+(.*)$/);
    if (detailed) return { name: detailed[1].trim(), type: detailed[2].trim(), description: detailed[3].trim() };
    const simple = line.match(/^([^:：]+)\s*[:：]\s*(.*)$/);
    return simple ? { name: simple[1].trim(), type: simple[2].trim(), description: '' } : { name: line, type: '', description: '' };
  });
}

function stripFence(value: string) {
  return value.replace(/^```[^\n]*\n?/, '').replace(/\n?```$/, '').trim();
}

export function parseNotionInterviewQuestion(source: NotionInterviewSource): InterviewImportPayload {
  const buckets = new Map<Section, string[]>();
  const codeBlocks: Array<{ section: Section; language: string; text: string }> = [];
  let current: Section = 'unknown';
  const add = (section: Section, value: string) => {
    if (!value.trim()) return;
    buckets.set(section, [...(buckets.get(section) || []), value.trim()]);
  };

  for (const block of source.blocks) {
    const mapped = sectionFor(block.text);
    if (block.type.startsWith('heading_')) {
      current = mapped;
      continue;
    }
    const lines = block.text.split(/\r?\n/);
    const containsMappedLines = lines.length > 1 && lines.some((line) => inlineSection(line));
    if (containsMappedLines) {
      for (const line of lines) {
        const nested = inlineSection(line);
        if (nested) {
          current = nested.section;
          add(current, nested.content);
        } else {
          add(current, line);
        }
      }
      continue;
    }
    const inline = inlineSection(block.text);
    if (inline) {
      current = inline.section;
      add(current, inline.content);
      continue;
    }
    if (mapped !== 'unknown' && block.text.length < 80 && block.type !== 'code') {
      current = mapped;
      continue;
    }
    if (block.type === 'code') {
      codeBlocks.push({ section: current, language: (block.language || '').toLowerCase(), text: block.text });
      continue;
    }
    add(current, block.type.includes('list_item') ? `- ${block.text}` : block.text);
  }

  const sectionText = (section: Section) => (buckets.get(section) || []).join('\n').trim();
  const functionText = sectionText('function');
  const approachText = sectionText('approach');
  const solutionText = sectionText('solution');
  const complexityText = sectionText('complexity');
  const analysisText = sectionText('analysis');
  const codesFor = (sections: Section[], languages: string[]) => codeBlocks.find((block) => sections.includes(block.section) && languages.some((language) => block.language.includes(language)))?.text || '';
  const genericCode = codeBlocks.find((block) => ['solution', 'pythonSolution', 'javaSolution', 'cppSolution'].includes(block.section))?.text || '';

  const python = codesFor(['solution', 'pythonSolution'], ['python']) || stripFence(sectionText('pythonSolution')) || (genericCode && /python/.test(codeBlocks.find((block) => block.text === genericCode)?.language || '') ? genericCode : '');
  const java = codesFor(['solution', 'javaSolution'], ['java']) || stripFence(sectionText('javaSolution')) || (genericCode && codeBlocks.find((block) => block.text === genericCode)?.language === 'java' ? genericCode : '');
  const cpp = codesFor(['solution', 'cppSolution'], ['c++', 'cpp']) || stripFence(sectionText('cppSolution')) || (genericCode && /(c\+\+|cpp)/.test(codeBlocks.find((block) => block.text === genericCode)?.language || '') ? genericCode : '');
  const unlabeledSolution = stripFence(solutionText);

  return normalizeInterviewImportPayload({
    title: sectionText('title') || source.title,
    company: sectionText('company') || source.company,
    role: sectionText('role'),
    difficulty: sectionText('difficulty'),
    stage: sectionText('stage'),
    category: splitList(sectionText('category')),
    topics: splitList(sectionText('topics')),
    problemDescription: sectionText('problem') || sectionText('unknown'),
    examples: parseExamples(sectionText('example')),
    functionDescription: {
      functionName: labelled(functionText, ['Function Name', '函数名', '方法名']),
      parameters: parseParameters(functionText),
      returnDescription: labelled(functionText, ['Return Description', 'Returns', 'Return', '返回值', '返回']),
    },
    constraints: splitLines(sectionText('constraints')),
    approach: {
      coreIdea: sectionText('coreIdea') || labelled(approachText, ['Core Idea', 'How to Think', '核心思路', '如何思考']) || (!sectionText('algorithmSteps') && !sectionText('whyWorks') && !sectionText('edgeCases') ? approachText : ''),
      algorithmSteps: sectionText('algorithmSteps') || labelled(approachText, ['Algorithm Steps', 'Step-by-step Approach', '算法步骤', '解题步骤']),
      whyWorks: sectionText('whyWorks') || labelled(approachText, ['Why This Works', 'Why It Works', '为什么可行', '正确性']),
      edgeCases: sectionText('edgeCases') || labelled(approachText, ['Edge Cases', '边界情况', '特殊情况']),
    },
    solution: {
      python: python || (!java && !cpp ? unlabeledSolution : ''),
      java,
      cpp,
    },
    complexity: {
      time: sectionText('timeComplexity') || labelled(complexityText, ['Time Complexity', '时间复杂度']),
      space: sectionText('spaceComplexity') || labelled(complexityText, ['Space Complexity', '空间复杂度']),
    },
    aiAnalysis: {
      interviewIntent: sectionText('interviewIntent') || labelled(analysisText, ['Interview Intent', 'Interview Focus', 'What interviewer is testing', '面试官意图', '考察意图']),
      keyConcepts: sectionText('keyConcepts') || labelled(analysisText, ['Key Concepts', '关键概念', '核心知识点']),
      commonMistakes: sectionText('commonMistakes') || labelled(analysisText, ['Common Mistakes', '常见错误']),
      followUpQuestions: sectionText('followUpQuestions') || labelled(analysisText, ['Follow-up Questions', 'Follow Up Questions', '追问问题']),
      betterStrategy: sectionText('betterStrategy') || labelled(analysisText, ['Better Strategy', 'Better Answer Strategy', '改进策略', '更好的回答策略']),
    },
  });
}

export function blocksToPlainText(blocks: NotionContentBlock[]) {
  return blocks.map((block) => `${'  '.repeat(block.depth)}${block.type === 'code' ? `\`\`\`${block.language || ''}\n${block.text}\n\`\`\`` : block.text}`).filter(Boolean).join('\n');
}

import { normalizeInterviewImportPayload, type InterviewImportPayload } from "@/lib/interview-import-schema";

type Section =
  | "title" | "company" | "role" | "difficulty" | "stage" | "category" | "topics"
  | "problemDescription" | "examples" | "functionName" | "parameters" | "returnDescription"
  | "constraints" | "coreIdea" | "algorithmSteps" | "whyWorks" | "edgeCases"
  | "solution" | "python" | "java" | "cpp" | "time" | "space"
  | "interviewIntent" | "keyConcepts" | "commonMistakes" | "followUpQuestions" | "betterStrategy";

const aliases: Record<Section, string[]> = {
  title: ["title", "question title", "题目", "题目标题", "标题"],
  company: ["company", "公司"],
  role: ["role", "position", "职位", "岗位"],
  difficulty: ["difficulty", "难度"],
  stage: ["stage", "interview type", "interview stage", "面试类型", "面试阶段"],
  category: ["category", "categories", "分类", "题型"],
  topics: ["topics", "topic", "tags", "知识点", "标签"],
  problemDescription: ["problem description", "problem", "description", "题目描述", "问题描述"],
  examples: ["example", "examples", "sample", "samples", "示例", "样例"],
  functionName: ["function name", "method name", "函数名", "方法名"],
  parameters: ["parameters", "parameter", "params", "参数"],
  returnDescription: ["return description", "returns", "return", "返回值", "返回描述"],
  constraints: ["constraints", "constraint", "限制", "约束", "限制条件"],
  coreIdea: ["approach", "solution approach", "core idea", "how to think", "思路", "核心思路", "解题思路"],
  algorithmSteps: ["algorithm steps", "step-by-step approach", "steps", "算法步骤", "解题步骤"],
  whyWorks: ["why this works", "why it works", "correctness", "key observations", "为什么可行", "正确性", "关键观察"],
  edgeCases: ["edge cases", "edge case", "边界情况", "特殊情况"],
  solution: ["solution", "code", "reference solution", "代码", "参考代码", "解法"],
  python: ["python solution", "python code", "python 代码", "python 解法"],
  java: ["java solution", "java code", "java 代码", "java 解法"],
  cpp: ["c++ solution", "cpp solution", "c++ code", "cpp code", "c++ 代码", "cpp 代码"],
  time: ["time complexity", "时间复杂度"],
  space: ["space complexity", "空间复杂度"],
  interviewIntent: ["interview intent", "interview focus", "what interviewer is testing", "面试意图", "考察意图", "面试重点"],
  keyConcepts: ["key concepts", "关键概念", "核心知识点"],
  commonMistakes: ["common mistakes", "常见错误"],
  followUpQuestions: ["follow up", "follow-up", "follow up questions", "follow-up questions", "追问", "追问问题"],
  betterStrategy: ["better strategy", "better answer strategy", "改进策略", "更好的回答策略"],
};

const cleanLabel = (value: string) => value.toLowerCase().replace(/^\s*#{1,6}\s*/, "").replace(/[*_`]/g, "").replace(/^\d+[.)、]\s*/, "").replace(/[：:]\s*$/, "").replace(/\s+/g, " ").trim();
const splitList = (value: string) => value.split(/\r?\n|[,，;；]/).map((item) => item.replace(/^\s*(?:[-*•]|\d+[.)、])\s*/, "").trim()).filter(Boolean);
const splitLines = (value: string) => value.split(/\r?\n/).map((item) => item.replace(/^\s*(?:[-*•]\s+|\d+[.)、]\s*)/, "").trim()).filter(Boolean);
const sectionFor = (label: string): Section | undefined => {
  const normalized = cleanLabel(label).replace(/\s+\d+$/, "");
  return (Object.keys(aliases) as Section[]).find((section) => aliases[section].some((alias) => cleanLabel(alias) === normalized));
};

function parseExamples(text: string) {
  const examples: Array<{ input: string; output: string; explanation: string }> = [];
  let inExamples = false;
  let example: { input: string; output: string; explanation: string } | undefined;
  let field: "input" | "output" | "explanation" | undefined;
  const save = () => {
    if (example && (example.input || example.output || example.explanation)) examples.push(example);
    example = undefined;
    field = undefined;
  };

  for (const originalLine of text.split(/\r?\n/)) {
    const trimmed = originalLine.trim();
    if (/^#{1,2}\s*\d+[.)]?\s*(?:Examples?|示例|样例)\s*$/i.test(trimmed)) { inExamples = true; continue; }
    if (inExamples && /^#{1,2}\s*\d+[.)]?\s+/.test(trimmed)) break;
    if (/^(?:#{1,6}\s*)?(?:Example|示例|样例)\s*\d*\s*[:：]?\s*$/i.test(trimmed)) {
      if (!inExamples) inExamples = true;
      save();
      example = { input: "", output: "", explanation: "" };
      continue;
    }
    if (!inExamples || /^```/.test(trimmed)) continue;

    const label = trimmed.replace(/^\*\*(.*?)\*\*$/, "$1").replace(/[:：]\s*$/, "").toLowerCase();
    if (label === "input" || label === "输入") { example ||= { input: "", output: "", explanation: "" }; field = "input"; continue; }
    if (label === "output" || label === "输出") { example ||= { input: "", output: "", explanation: "" }; field = "output"; continue; }
    if (["explanation", "解释", "说明"].includes(label)) { example ||= { input: "", output: "", explanation: "" }; field = "explanation"; continue; }
    if (example && field && trimmed) example[field] = [example[field], originalLine.trimEnd()].filter(Boolean).join("\n");
  }
  save();
  return examples;
}

function parseParameters(text: string) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const tableParameters = lines.map((line) => line.replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim())).filter((cells) => cells.length >= 3 && !/^(name|名称)$/i.test(cells[0]) && !cells.every((cell) => /^:?-{2,}:?$/.test(cell))).map((cells) => ({ name: cells[0], type: cells[1], description: cells.slice(2).join(" | ") }));
  if (tableParameters.length) return tableParameters;

  const structured: Array<{ name: string; type: string; description: string }> = [];
  let parameter: { name: string; type: string; description: string } | undefined;
  for (const line of lines) {
    const field = line.match(/^(?:\*\*)?(NAME|TYPE|DESCRIPTION|名称|类型|描述)(?:\*\*)?\s*[:：]\s*(.*)$/i);
    if (!field) {
      if (parameter) parameter.description = [parameter.description, line].filter(Boolean).join("\n");
      continue;
    }
    const label = field[1].toLowerCase();
    if (label === "name" || label === "名称") {
      if (parameter?.name) structured.push(parameter);
      parameter = { name: field[2].trim(), type: "", description: "" };
    } else if (parameter && (label === "type" || label === "类型")) parameter.type = field[2].trim();
    else if (parameter) parameter.description = field[2].trim();
  }
  if (parameter?.name) structured.push(parameter);
  if (structured.length) return structured;

  return splitLines(text).map((line) => {
    const pipe = line.split("|").map((item) => item.trim());
    if (pipe.length >= 3) return { name: pipe[0], type: pipe[1], description: pipe.slice(2).join(" | ") };
    const match = line.match(/^([^:：-]+)\s*[:：]\s*(.*?)(?:\s+-\s+|\s+—\s+)(.*)$/);
    if (match) return { name: match[1].trim(), type: match[2].trim(), description: match[3].trim() };
    const short = line.match(/^([^:：]+)\s*[:：]\s*(.*)$/);
    return short ? { name: short[1].trim(), type: short[2].trim(), description: "" } : { name: line, type: "", description: "" };
  });
}

export function parseProblemImportText(raw: string): InterviewImportPayload {
  const source = raw.trim();
  if (!source) return normalizeInterviewImportPayload({});
  if (source.startsWith("{")) {
    try { return normalizeInterviewImportPayload(JSON.parse(source)); } catch { /* parse as labelled text */ }
  }

  const buckets = new Map<Section, string[]>();
  const add = (section: Section, value: string) => { if (value.trim()) buckets.set(section, [...(buckets.get(section) || []), value.trim()]); };
  let current: Section | undefined;
  let codeLanguage = "";
  let contentFence = false;
  let code: string[] = [];

  for (const originalLine of source.split(/\r?\n/)) {
    const line = originalLine.trimEnd();
    const fence = line.trim().match(/^```\s*([^\s`]*)/);
    if (fence) {
      if (contentFence) { contentFence = false; continue; }
      if (!codeLanguage && current && !["solution", "python", "java", "cpp"].includes(current)) { contentFence = true; continue; }
      if (!codeLanguage) { codeLanguage = fence[1].toLowerCase() || (current === "java" ? "java" : current === "cpp" ? "cpp" : "python"); code = []; }
      else { add(/^(java)$/.test(codeLanguage) ? "java" : /^(c\+\+|cpp|cxx)$/.test(codeLanguage) ? "cpp" : "python", code.join("\n")); codeLanguage = ""; code = []; }
      continue;
    }
    if (contentFence) { if (current) add(current, originalLine); continue; }
    if (codeLanguage) { code.push(originalLine); continue; }

    const inline = line.match(/^\s*(?:#{1,6}\s*)?(?:\*\*)?([^:：*]{1,60})(?:\*\*)?\s*[:：]\s*(.*)$/);
    const headingText = line.replace(/^\s*#{1,6}\s*/, "").replace(/^\*\*(.*?)\*\*$/, "$1").trim();
    if (/^\d+[.)]?\s*AI Analysis$/i.test(headingText)) { current = undefined; continue; }
    const contextualLabel = cleanLabel(inline?.[1] || headingText);
    if (current === "parameters" && /^(name|type|description|名称|类型|描述)$/.test(contextualLabel)) { add("parameters", originalLine); continue; }
    if (current === "returnDescription" && /^(description|描述)$/.test(contextualLabel)) continue;
    if (current === "examples" && /^(input|output|explanation|输入|输出|解释|说明)$/.test(contextualLabel)) { add("examples", originalLine); continue; }
    const mapped = inline ? sectionFor(inline[1]) : sectionFor(headingText);
    if (mapped) { current = mapped; if (inline?.[2]) add(mapped, inline[2]); continue; }
    if (current) add(current, originalLine);
  }
  if (codeLanguage && code.length) add(/^(java)$/.test(codeLanguage) ? "java" : /^(c\+\+|cpp|cxx)$/.test(codeLanguage) ? "cpp" : "python", code.join("\n"));

  const get = (section: Section) => (buckets.get(section) || []).join("\n").trim();
  const fallbackTitle = source.split(/\r?\n/).map((line) => line.replace(/^#+\s*/, "").trim()).find((line) => line && !sectionFor(line)) || "";
  return normalizeInterviewImportPayload({
    title: get("title") || fallbackTitle,
    company: get("company"), role: get("role"), difficulty: get("difficulty"), stage: get("stage"),
    category: splitList(get("category")), topics: splitList(get("topics")), problemDescription: get("problemDescription"),
    examples: parseExamples(source),
    functionDescription: { functionName: get("functionName"), parameters: parseParameters(get("parameters")), returnDescription: get("returnDescription") },
    constraints: splitLines(get("constraints")),
    approach: { coreIdea: get("coreIdea"), algorithmSteps: get("algorithmSteps"), whyWorks: get("whyWorks"), edgeCases: get("edgeCases") },
    solution: { python: get("python") || get("solution"), java: get("java"), cpp: get("cpp") },
    complexity: { time: get("time"), space: get("space") },
    aiAnalysis: { interviewIntent: get("interviewIntent"), keyConcepts: get("keyConcepts"), commonMistakes: get("commonMistakes"), followUpQuestions: get("followUpQuestions"), betterStrategy: get("betterStrategy") },
  });
}

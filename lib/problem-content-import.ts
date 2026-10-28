import { normalizeInterviewImportPayload, validateInterviewImportPayload, type InterviewImportPayload } from "@/lib/interview-import-schema";

export type ProblemImportDiagnostics = {
  recognizedFields: string[];
  missingFields: string[];
  warnings: string[];
};
export type ProblemImportFeedback = {
  tone: "success" | "warning" | "error";
  message: string;
};

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
  solution: ["solution", "solutions", "code", "reference solution", "代码", "参考代码", "解法"],
  python: ["python", "python solution", "python code", "python 代码", "python 解法"],
  java: ["java", "java solution", "java code", "java 代码", "java 解法"],
  cpp: ["c++", "cpp", "cxx", "c++ solution", "cpp solution", "c++ code", "cpp code", "c++ 代码", "cpp 代码"],
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
type SolutionLanguage = "python" | "java" | "cpp";

const solutionLanguageFor = (value: string): SolutionLanguage | undefined => {
  const label = cleanLabel(value).replace(/^solutions?\s+/, "").replace(/\s+(?:solution|code)$/, "");
  if (/^(?:python|py|python\s*3)$/.test(label)) return "python";
  if (/^java$/.test(label)) return "java";
  if (/^(?:c\+\+|cpp|cxx)$/.test(label)) return "cpp";
  return undefined;
};

const standaloneSolutionLanguageMarker = (value: string) => {
  const trimmed = value.trim();
  if (!/^\s*(?:#{1,6}\s*)?(?:\*\*)?(?:Python(?:\s*3)?|Py|Java|C\+\+|CPP|CXX)(?:\s+(?:Solution|Code))?(?:\*\*)?\s*:?\s*$/i.test(trimmed)) return undefined;
  return solutionLanguageFor(trimmed.replace(/^\s*#{1,6}\s*/, "").replace(/^\s*\*\*(.*?)\*\*\s*$/, "$1").replace(/:\s*$/, ""));
};

const detectSolutionLanguage = (code: string, fallback: SolutionLanguage = "python"): SolutionLanguage => {
  if (/#include\s*[<"]|\busing\s+namespace\s+std\b|\bstd::|\bvector\s*</.test(code)) return "cpp";
  if (/\bimport\s+java\.|\bpackage\s+[\w.]+\s*;|\bpublic\s+(?:final\s+)?class\b|\bSystem\.out\.|\bList\s*</.test(code)) return "java";
  if (/\bfrom\s+\S+\s+import\b|\bdef\s+\w+\s*\(|\bself\b/.test(code)) return "python";
  return fallback;
};

function splitMultilanguageCodeBlock(value: string, fallback: SolutionLanguage) {
  const sections: Array<{ language: SolutionLanguage; code: string }> = [];
  let language: SolutionLanguage | undefined;
  let lines: string[] = [];
  let foundLanguageMarker = false;
  const save = () => {
    const code = lines.join("\n").trim();
    if (code) sections.push({ language: language || detectSolutionLanguage(code, fallback), code });
    lines = [];
  };

  for (const originalLine of value.split(/\r?\n/)) {
    const marker = standaloneSolutionLanguageMarker(originalLine);
    if (marker) {
      save();
      language = marker;
      foundLanguageMarker = true;
      continue;
    }
    lines.push(originalLine);
  }
  save();
  return foundLanguageMarker ? sections : [{ language: detectSolutionLanguage(value, fallback), code: value.trim() }];
}

const normalizeImportedCode = (value: string, language: "python" | "java" | "cpp") => {
  let code = value.replace(/<br\s*\/?>/gi, "\n").replace(/\\r\\n|\\n|\\r/g, "\n").replace(/\u00a0/g, " ").trim();
  if (language !== "python" || code.includes("\n") || code.length < 120) return code;
  // Some pasted sources preserve indentation as runs of spaces while losing every newline.
  // Split before both Python keywords and common executable statements so code does not
  // remain swallowed by the preceding comment.
  code = code.replace(
    /\s{2,}(?=(?:#|class\s+|def\s+|async\s+def\s+|@\w+|from\s+\S+\s+import\s+|import\s+|if\s+|elif\s+|else\s*:|for\s+|while\s+|try\s*:|except\b|finally\s*:|with\s+|return\b|raise\b|pass\b|break\b|continue\b|print\s*\(|[A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*(?:\[[^\]]+\])*\s*(?:=|\+=|-=|\*=|\/=|\.\w+\s*\()))/g,
    (spacing) => `\n${spacing.slice(0, 20)}`,
  );
  code = code.replace(/(?<=\S)(#\s*(?:Create|Run|Define|Calculate|Print|Example|Sample)\b)/g, "\n$1");

  // Reference solutions should contain the implementation, not pasted demo/bootstrap code.
  const demoStart = code.search(/^\s*#\s*(?:Create (?:a |the )?(?:solution|solver)|Create sample|Run (?:a |the )?sample|Define sample|Example usage|Sample usage)\b/im);
  if (demoStart >= 0) code = code.slice(0, demoStart).trimEnd();
  const mainGuard = code.search(/^\s*if\s+__name__\s*==\s*["']__main__["']\s*:/m);
  if (mainGuard >= 0) code = code.slice(0, mainGuard).trimEnd();
  return code.trim();
};
const sectionFor = (label: string): Section | undefined => {
  const normalized = cleanLabel(label).replace(/\s+\d+$/, "");
  return (Object.keys(aliases) as Section[]).find((section) => aliases[section].some((alias) => cleanLabel(alias) === normalized));
};
const parseInlineLabel = (value: string) => {
  const stripped = value.replace(/^\s*#{1,6}\s*/, "").trim();
  const bold = stripped.match(/^\*\*\s*([^*:：]{1,60}?)\s*[:：]?\s*\*\*\s*(?:[:：]\s*)?(.*)$/);
  if (bold) return { label: bold[1].trim(), value: bold[2].trim() };
  const plain = stripped.match(/^([^:：]{1,60})[:：]\s*(.*)$/);
  return plain ? { label: plain[1].trim(), value: plain[2].trim() } : undefined;
};
const isSectionBoundary = (line: string) => {
  const heading = cleanLabel(line);
  const plainContainerHeading = ["basic information", "function description", "ai analysis", "solutions"].includes(heading);
  if (plainContainerHeading) return true;
  const isMarkdownHeading = /^\s*#{1,6}\s+/.test(line);
  const isBoldHeading = /^\s*\*\*[^*]+\*\*\s*[:：]?\s*$/.test(line);
  if (!isMarkdownHeading && !isBoldHeading) return false;
  return Boolean(sectionFor(heading)) || ["basic information", "function description", "ai analysis"].includes(heading);
};
const isFenceLine = (line: string) => /^\s*(?:```|~~~)/.test(line);
const isRecoveryBoundary = (line: string) => {
  const trimmed = line.trim();
  const explicitHeading = /^\s*#{2,6}\s+/.test(line) || /^\s*\*\*[^*]+\*\*\s*[:：]?\s*$/.test(line);
  const plainContainer = ["basic information", "function description", "complexity", "ai analysis", "solutions"].includes(cleanLabel(trimmed));
  return (explicitHeading || plainContainer) && isSectionBoundary(trimmed);
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
    if (inExamples && isSectionBoundary(trimmed) && !/^(?:#{1,6}\s*)?(?:Example|Examples|示例|样例)\b/i.test(trimmed)) break;
    if (/^(?:#{1,6}\s*)?(?:Example|示例|样例)\s*\d*\s*[:：]?\s*$/i.test(trimmed)) {
      if (!inExamples) inExamples = true;
      save();
      example = { input: "", output: "", explanation: "" };
      continue;
    }
    if (!inExamples || isFenceLine(trimmed)) continue;

    const label = trimmed.replace(/^\*\*(.*?)\*\*$/, "$1").replace(/[:：]\s*$/, "").toLowerCase();
    if (label === "input" || label === "输入") { example ||= { input: "", output: "", explanation: "" }; field = "input"; continue; }
    if (label === "output" || label === "输出") { example ||= { input: "", output: "", explanation: "" }; field = "output"; continue; }
    if (["explanation", "解释", "说明"].includes(label)) { example ||= { input: "", output: "", explanation: "" }; field = "explanation"; continue; }
    if (example && field && trimmed) example[field] = [example[field], originalLine.trimEnd()].filter(Boolean).join("\n");
  }
  save();
  return examples;
}

function parseMarkdownExamples(text: string) {
  const examples: Array<{ input: string; output: string; explanation: string }> = [];
  let inExamples = false;
  let example: { input: string; output: string; explanation: string } | undefined;
  let field: "input" | "output" | "explanation" | undefined;
  const heading = (value: string) => value.trim().replace(/^#{1,6}\s*/, "").replace(/^\*\*\s*(.*?)\s*\*\*$/, "$1").replace(/^\d+[.)]?\s*/, "").replace(/[:\uFF1A]\s*$/, "").trim();
  const isExampleHeading = (value: string) => /^(?:examples?|\u793a\u4f8b|\u6837\u4f8b)(?:\s*\d+)?$/i.test(heading(value));
  const save = () => {
    if (example && (example.input || example.output || example.explanation)) examples.push(example);
    example = undefined;
    field = undefined;
  };

  for (const originalLine of text.split(/\r?\n/)) {
    const trimmed = originalLine.trim();
    if (isExampleHeading(trimmed)) {
      inExamples = true;
      save();
      example = { input: "", output: "", explanation: "" };
      continue;
    }
    if (inExamples && isSectionBoundary(trimmed)) break;
    if (!inExamples || isFenceLine(trimmed)) continue;

    const boldInline = trimmed.match(/^\*\*\s*(input|output|explanation|输入|输出|解释|说明)\s*[:：]?\s*\*\*\s*(?:[:：]\s*)?(.*)$/i);
    const plainInline = trimmed.match(/^(input|output|explanation|输入|输出|解释|说明)\s*[:：]\s*(.*)$/i);
    const inlineField = boldInline || plainInline;
    if (inlineField) {
      example ||= { input: "", output: "", explanation: "" };
      const inlineLabel = inlineField[1].toLowerCase();
      field = inlineLabel === "input" || inlineLabel === "输入" ? "input" : inlineLabel === "output" || inlineLabel === "输出" ? "output" : "explanation";
      const inlineValue = inlineField[2].trim();
      if (inlineValue) example[field] = [example[field], inlineValue].filter(Boolean).join("\n");
      continue;
    }

    const label = heading(trimmed).toLowerCase();
    if (label === "input" || label === "\u8f93\u5165") { example ||= { input: "", output: "", explanation: "" }; field = "input"; continue; }
    if (label === "output" || label === "\u8f93\u51fa") { example ||= { input: "", output: "", explanation: "" }; field = "output"; continue; }
    if (["explanation", "\u89e3\u91ca", "\u8bf4\u660e"].includes(label)) { example ||= { input: "", output: "", explanation: "" }; field = "explanation"; continue; }
    if (example && field && trimmed) example[field] = [example[field], originalLine.trimEnd()].filter(Boolean).join("\n");
  }
  save();
  return examples;
}

function parseParameters(text: string) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const cleanTableCell = (cell: string) => cell.trim().replace(/^\*\*\s*(.*?)\s*\*\*$/, "$1").replace(/^`\s*(.*?)\s*`$/, "$1").trim();
  const tableParameters = lines
    .map((line) => line.replace(/^\||\|$/g, "").split("|").map(cleanTableCell))
    .filter((cells) => cells.length >= 3 && !/^(name|名称)$/i.test(cells[0]) && !cells.every((cell) => /^:?-{2,}:?$/.test(cell)))
    .map((cells) => ({ name: cells[0], type: cells[1], description: cells.slice(2).join(" | ") }));
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

const inferFunctionNameFromSolutions = (solutions: { python: string; java: string; cpp: string }) => {
  const pythonNames = [...solutions.python.matchAll(/^\s*(?:async\s+)?def\s+([A-Za-z_]\w*)\s*\(/gm)].map((match) => match[1]);
  const pythonName = pythonNames.find((name) => !["__init__", "main"].includes(name));
  if (pythonName) return pythonName;

  const javaNames = [...solutions.java.matchAll(/\b(?:public|protected|private)\s+(?:static\s+)?(?:[\w<>,.?\[\]]+\s+)+([A-Za-z_]\w*)\s*\(/g)].map((match) => match[1]);
  const javaName = javaNames.find((name) => !["main", "Solution"].includes(name));
  if (javaName) return javaName;

  const cppNames = [...solutions.cpp.matchAll(/(?:^|[;}\n])\s*(?:[\w:<>]+[\s*&]+)+([A-Za-z_]\w*)\s*\([^;{}]*\)\s*(?:const\s*)?\{/g)].map((match) => match[1]);
  return cppNames.find((name) => name !== "main") || "";
};

export function parseProblemImportText(raw: string): InterviewImportPayload {
  // Parse the original fence sequence directly. Rewriting a
  // ``` / Java / ``` sequence is ambiguous: in normal Markdown those two
  // fences are the previous block's close and the next block's open.
  const source = raw.trim();
  if (!source) return normalizeInterviewImportPayload({});
  const fencedJson = source.match(/^\s*(```|~~~)\s*json\s*\r?\n([\s\S]*?)\r?\n\1\s*$/i);
  const jsonSource = fencedJson?.[2]?.trim() || source;
  if (jsonSource.startsWith("{")) {
    try { return normalizeInterviewImportPayload(JSON.parse(jsonSource)); } catch { /* parse as labelled text */ }
  }

  const buckets = new Map<Section, string[]>();
  const add = (section: Section, value: string) => { if (value.trim()) buckets.set(section, [...(buckets.get(section) || []), value.trim()]); };
  const addCodeBlock = (value: string, hintedLanguage: string, section?: Section) => {
    const fallback = solutionLanguageFor(hintedLanguage) || (section === "java" ? "java" : section === "cpp" ? "cpp" : section === "python" ? "python" : "python");
    for (const part of splitMultilanguageCodeBlock(value, fallback)) add(part.language, part.code);
  };
  let current: Section | undefined;
  let codeLanguage = "";
  let contentFence = false;
  let fenceMarker = "";
  let code: string[] = [];

  for (const originalLine of source.split(/\r?\n/)) {
    const line = originalLine.trimEnd();
    if ((contentFence || codeLanguage) && isRecoveryBoundary(line)) {
      if (codeLanguage && code.length) addCodeBlock(code.join("\n"), codeLanguage, current);
      contentFence = false;
      codeLanguage = "";
      fenceMarker = "";
      code = [];
    }
    const fence = line.trim().match(/^(```|~~~)\s*([^\s`~]*)/);
    if (fence) {
      const marker = fence[1];
      const languageHint = fence[2];
      if (contentFence) {
        if (marker === fenceMarker) { contentFence = false; fenceMarker = ""; }
        else if (current) add(current, originalLine);
        continue;
      }
      if (codeLanguage) {
        if (marker !== fenceMarker) { code.push(originalLine); continue; }
        const block = code.join("\n");
        const renderedLanguageLabel = standaloneSolutionLanguageMarker(block);
        if (renderedLanguageLabel) current = renderedLanguageLabel;
        else addCodeBlock(block, codeLanguage, current);
        codeLanguage = "";
        fenceMarker = "";
        code = [];
        continue;
      }
      if (current && !["solution", "python", "java", "cpp"].includes(current)) { contentFence = true; fenceMarker = marker; continue; }
      codeLanguage = languageHint.toLowerCase() || (current === "java" ? "java" : current === "cpp" ? "cpp" : current === "python" ? "python" : "auto");
      fenceMarker = marker;
      code = [];
      continue;
    }
    if (contentFence) { if (current) add(current, originalLine); continue; }
    if (codeLanguage) { code.push(originalLine); continue; }

    const inline = parseInlineLabel(line);
    const headingText = line.replace(/^\s*#{1,6}\s*/, "").replace(/^\*\*(.*?)\*\*$/, "$1").trim();
    const containerHeading = cleanLabel(headingText).replace(/^\d+[.)]?\s*/, "");
    if (["basic information", "function description", "complexity", "ai analysis", "solutions"].includes(containerHeading)) {
      current = undefined;
      continue;
    }
    const contextualLabel = cleanLabel(inline?.label || headingText);
    if (current === "parameters" && /^(name|type|description|名称|类型|描述)$/.test(contextualLabel)) { add("parameters", originalLine); continue; }
    if (current === "returnDescription" && /^(description|描述)$/.test(contextualLabel)) continue;
    if (current === "examples" && /^(input|output|explanation|输入|输出|解释|说明)$/.test(contextualLabel)) { add("examples", originalLine); continue; }
    const mapped = inline ? sectionFor(inline.label) : sectionFor(headingText);
    if (mapped) { current = mapped; if (inline?.value) add(mapped, inline.value); continue; }
    if (current) add(current, originalLine);
  }
  if (codeLanguage && code.length) addCodeBlock(code.join("\n"), codeLanguage, current);

  const get = (section: Section) => (buckets.get(section) || []).join("\n").trim();
  const fallbackTitle = source.split(/\r?\n/).map((line) => {
    const match = line.match(/^\s*#\s+(.+?)\s*$/);
    return match?.[1]?.trim() || "";
  }).find((line) => line && !sectionFor(line)) || "";
  const genericSolution = get("solution");
  const solutionBuckets = { python: get("python"), java: get("java"), cpp: get("cpp") };
  if (genericSolution) {
    const language = detectSolutionLanguage(genericSolution);
    if (!solutionBuckets[language]) solutionBuckets[language] = genericSolution;
  }
  const importedFunctionName = get("functionName") || inferFunctionNameFromSolutions(solutionBuckets);
  const payload = normalizeInterviewImportPayload({
    title: get("title") || fallbackTitle,
    company: get("company"), role: get("role"), difficulty: get("difficulty"), stage: get("stage"),
    category: splitList(get("category")), topics: splitList(get("topics")), problemDescription: get("problemDescription"),
    examples: parseMarkdownExamples(source),
    functionDescription: { functionName: importedFunctionName, parameters: parseParameters(get("parameters")), returnDescription: get("returnDescription") },
    constraints: splitLines(get("constraints")),
    approach: { coreIdea: get("coreIdea"), algorithmSteps: get("algorithmSteps"), whyWorks: get("whyWorks"), edgeCases: get("edgeCases") },
    solution: { python: normalizeImportedCode(solutionBuckets.python, "python"), java: normalizeImportedCode(solutionBuckets.java, "java"), cpp: normalizeImportedCode(solutionBuckets.cpp, "cpp") },
    complexity: { time: get("time"), space: get("space") },
    aiAnalysis: { interviewIntent: get("interviewIntent"), keyConcepts: get("keyConcepts"), commonMistakes: get("commonMistakes"), followUpQuestions: get("followUpQuestions"), betterStrategy: get("betterStrategy") },
  });
  // `solve` remains the runtime fallback elsewhere, but it must not be shown as
  // if it had been recognized from pasted content.
  if (!importedFunctionName) payload.functionDescription.functionName = "";
  return payload;
}

const hasExplicitSection = (raw: string, target: Section) => raw.split(/\r?\n/).some((line) => {
  const inline = parseInlineLabel(line);
  const heading = line.replace(/^\s*#{1,6}\s*/, "").replace(/^\s*\*\*(.*?)\*\*\s*$/, "$1").trim();
  return sectionFor(inline?.label || heading) === target;
});

export function parseProblemImportTextWithDiagnostics(raw: string): { payload: InterviewImportPayload; diagnostics: ProblemImportDiagnostics } {
  const payload = parseProblemImportText(raw);
  const recognizedFields: string[] = [];
  const add = (name: string, present: unknown) => { if (present) recognizedFields.push(name); };

  add("Title", payload.title);
  add("Company", payload.company);
  add("Role", payload.role);
  add("Difficulty", payload.difficulty);
  add("Stage", payload.stage);
  add("Category", payload.category.length);
  add("Topics", payload.topics.length);
  add("Problem Description", payload.problemDescription);
  payload.examples.forEach((example, index) => {
    add(`Example ${index + 1} Input`, example.input);
    add(`Example ${index + 1} Output`, example.output);
    add(`Example ${index + 1} Explanation`, example.explanation);
  });
  add("Function Name", payload.functionDescription.functionName);
  add("Parameters", payload.functionDescription.parameters.length);
  add("Return Description", payload.functionDescription.returnDescription);
  add("Constraints", payload.constraints.length);
  add("Approach", payload.approach.coreIdea);
  add("Algorithm Steps", payload.approach.algorithmSteps);
  add("Why It Works", payload.approach.whyWorks);
  add("Edge Cases", payload.approach.edgeCases);
  add("Python Solution", payload.solution.python);
  add("Java Solution", payload.solution.java);
  add("C++ Solution", payload.solution.cpp);
  add("Time Complexity", payload.complexity.time);
  add("Space Complexity", payload.complexity.space);
  add("Interview Intent", payload.aiAnalysis.interviewIntent);
  add("Key Concepts", payload.aiAnalysis.keyConcepts);
  add("Common Mistakes", payload.aiAnalysis.commonMistakes);
  add("Follow-up Questions", payload.aiAnalysis.followUpQuestions);
  add("Better Strategy", payload.aiAnalysis.betterStrategy);

  const warnings: string[] = [];
  const fenceState = { "```": false, "~~~": false } as Record<string, boolean>;
  for (const line of raw.split(/\r?\n/)) {
    const marker = line.trim().match(/^(```|~~~)/)?.[1];
    if (marker) fenceState[marker] = !fenceState[marker];
  }
  const unclosedMarkers = Object.entries(fenceState).filter(([, open]) => open).map(([marker]) => marker);
  if (unclosedMarkers.length) warnings.push(`Unclosed code fence detected (${unclosedMarkers.join(", ")}); later sections were recovered where possible.`);
  payload.examples.forEach((example, index) => {
    const missing = (["input", "output", "explanation"] as const).filter((field) => !example[field]);
    if (missing.length) warnings.push(`Example ${index + 1} is missing ${missing.join(", ")}.`);
  });
  if (!recognizedFields.length) warnings.push("No supported section labels or Markdown title were recognized.");

  const validation = validateInterviewImportPayload(payload);
  const missingFields = [...validation.missingFields];
  if (!payload.functionDescription.functionName && !payload.functionDescription.parameters.length && !payload.functionDescription.returnDescription) {
    if (!missingFields.includes("Function Description")) missingFields.push("Function Description");
  }
  const missingFieldOrder = ["Title", "Company", "Problem Description", "Role", "Difficulty", "Stage", "Category", "Topics", "Examples", "Function Description", "Constraints", "Approach", "Solution", "Complexity", "AI Analysis"];
  missingFields.sort((left, right) => missingFieldOrder.indexOf(left) - missingFieldOrder.indexOf(right));
  return { payload, diagnostics: { recognizedFields, missingFields, warnings } };
}

export function buildProblemImportFeedback(diagnostics: ProblemImportDiagnostics): ProblemImportFeedback {
  const recognizedCount = diagnostics.recognizedFields.length;
  const details = [
    diagnostics.missingFields.length ? `Missing: ${diagnostics.missingFields.join(", ")}.` : "",
    diagnostics.warnings.length ? `Warnings: ${diagnostics.warnings.join(" ")}` : "",
  ].filter(Boolean).join(" ");

  if (!recognizedCount) {
    return {
      tone: "error",
      message: `No recognized content was found. Use labelled sections such as Title, Problem Description, Example, or Solution. ${details}`.trim(),
    };
  }
  if (diagnostics.warnings.length || diagnostics.missingFields.length) {
    return {
      tone: "warning",
      message: `Import partially complete. ${recognizedCount} source fields were recognized. ${details}`.trim(),
    };
  }
  return {
    tone: "success",
    message: `Import complete. ${recognizedCount} source fields were recognized. Review the form before creating the problem.`,
  };
}

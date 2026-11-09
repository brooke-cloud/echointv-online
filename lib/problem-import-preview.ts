import type { InterviewImportPayload } from "@/lib/interview-import-schema";
import { validateProblemImportSemantics, type ImportValidationIssue } from "@/lib/problem-import-validation";

export type ImportConfidence = "high" | "medium" | "low";
export type ImportCandidateKey =
  | "title" | "company" | "role" | "difficulty" | "stage" | "category" | "topics" | "description"
  | "examples" | "functionName" | "parameters" | "returnDescription" | "constraintsText"
  | "approachHowToThink" | "approachObservations" | "approachSteps"
  | "solutionPython" | "solutionJava" | "solutionCpp" | "solutionJavascript" | "solutionSql"
  | "timeComplexity" | "spaceComplexity" | "aiInterviewFocus" | "aiKeyConcepts"
  | "aiCommonMistakes" | "aiFollowUpQuestions" | "aiBetterStrategy";

export type ProblemImportCandidate = {
  key: ImportCandidateKey;
  label: string;
  value: unknown;
  confidence: ImportConfidence;
  source: string;
  sourceLine?: number;
  warning?: string;
};

export type ProblemImportPreview = {
  candidates: ProblemImportCandidate[];
  warnings: string[];
  issues: ImportValidationIssue[];
};

const lineOf = (raw: string, pattern: RegExp) => {
  const index = raw.split(/\r?\n/).findIndex((line) => pattern.test(line));
  return index >= 0 ? index + 1 : undefined;
};

const hasJsonPayload = (raw: string) => {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/^\s*(```|~~~)\s*json\s*\r?\n([\s\S]*?)\r?\n\1\s*$/i);
  const candidate = fenced?.[2]?.trim() || trimmed;
  if (!candidate.startsWith("{")) return false;
  try { JSON.parse(candidate); return true; } catch { return false; }
};

function normalizedDifficulty(value: string) {
  const normalized = value.trim().toLowerCase();
  if (/^(easy|简单|容易)$/.test(normalized)) return "Easy";
  if (/^(medium|中等|中等难度)$/.test(normalized)) return "Medium";
  if (/^(hard|困难|难)$/.test(normalized)) return "Hard";
  return "";
}

function normalizedStage(value: string) {
  const normalized = value.trim().toLowerCase();
  if (/^(oa|online assessment|线上测评|笔试)$/.test(normalized)) return "OA";
  if (/^(vo|virtual onsite|coding interview|技术轮面|onsite)$/.test(normalized)) return "VO";
  return "";
}

export function buildProblemImportPreview(raw: string, payload: InterviewImportPayload): ProblemImportPreview {
  const candidates: ProblemImportCandidate[] = [];
  const warnings: string[] = [];
  const json = hasJsonPayload(raw);
  const add = (key: ImportCandidateKey, label: string, value: unknown, options?: Partial<Omit<ProblemImportCandidate, "key" | "label" | "value">>) => {
    const present = Array.isArray(value) ? value.length > 0 : typeof value === "string" ? Boolean(value.trim()) : Boolean(value);
    if (!present) return;
    candidates.push({ key, label, value, confidence: json ? "high" : options?.confidence || "high", source: json ? "JSON field" : options?.source || "Explicit section", sourceLine: options?.sourceLine, warning: options?.warning });
  };
  const explicit = (pattern: RegExp) => lineOf(raw, pattern);
  const field = (key: ImportCandidateKey, label: string, value: unknown, pattern: RegExp) => {
    const sourceLine = explicit(pattern);
    add(key, label, value, { confidence: sourceLine ? "high" : "medium", source: sourceLine ? "Explicit label" : "Inferred from content", sourceLine });
  };

  field("title", "Title", payload.title, /^\s*(?:#{1,6}\s*)?(?:\*\*)?title\b/i);
  field("company", "Company", payload.company, /^\s*(?:#{1,6}\s*)?(?:\*\*)?company\b/i);
  field("role", "Role", payload.role, /^\s*(?:#{1,6}\s*)?(?:\*\*)?(?:role|position)\b/i);

  if (payload.difficulty) {
    const value = normalizedDifficulty(payload.difficulty);
    if (value) field("difficulty", "Difficulty", value, /^\s*(?:#{1,6}\s*)?(?:\*\*)?difficulty\b/i);
    else warnings.push(`Unknown difficulty “${payload.difficulty}”; it was not selected automatically.`);
  }
  if (payload.stage) {
    const value = normalizedStage(payload.stage);
    if (value) field("stage", "Interview Type", value, /^\s*(?:#{1,6}\s*)?(?:\*\*)?(?:stage|interview type|interview stage)\b/i);
    else warnings.push(`Unknown interview type “${payload.stage}”; it was not selected automatically.`);
  }

  field("category", "Category", payload.category[0] || "", /^\s*(?:#{1,6}\s*)?(?:\*\*)?(?:category|categories)\b/i);
  field("topics", "Topics", payload.topics.join(", "), /^\s*(?:#{1,6}\s*)?(?:\*\*)?(?:topics?|tags)\b/i);
  field("description", "Problem Description", payload.problemDescription, /^\s*(?:#{1,6}\s*)?(?:\*\*)?(?:problem description|problem)\b/i);
  field("examples", "Examples", payload.examples, /^\s*(?:#{1,6}\s*)?(?:\d+[.)]\s*)?(?:\*\*)?(?:examples?|samples?)(?:\s*(?:#\s*|no\.?\s*)?\d+)?(?:\*\*)?\s*[:\uFF1A]?\s*$/im);
  field("functionName", "Function Name", payload.functionDescription.functionName, /^\s*(?:#{1,6}\s*)?(?:\*\*)?(?:function name|method name)\b/i);
  field("parameters", "Parameters", payload.functionDescription.parameters, /^\s*(?:#{1,6}\s*)?(?:\*\*)?(?:parameters?|params)\b/i);
  field("returnDescription", "Return Description", payload.functionDescription.returnDescription, /^\s*(?:#{1,6}\s*)?(?:\*\*)?(?:return description|returns?|return)\b/i);
  field("constraintsText", "Constraints", payload.constraints.join("\n"), /^\s*(?:#{1,6}\s*)?(?:\*\*)?constraints?\b/i);
  field("approachHowToThink", "How to Think", payload.approach.coreIdea, /^\s*(?:#{1,6}\s*)?(?:\*\*)?(?:approach|solution approach|core idea|how to think)\b/i);
  const observations = [payload.approach.whyWorks, payload.approach.edgeCases && `Edge Cases:\n${payload.approach.edgeCases}`].filter(Boolean).join("\n\n");
  field("approachObservations", "Key Observations", observations, /^\s*(?:#{1,6}\s*)?(?:\*\*)?(?:why this works|why it works|correctness|key observations|edge cases?)\b/i);
  field("approachSteps", "Step-by-step Approach", payload.approach.algorithmSteps, /^\s*(?:#{1,6}\s*)?(?:\*\*)?(?:algorithm steps|step-by-step approach|steps)\b/i);

  const solutions = [
    ["solutionPython", "Python Solution", payload.solution.python, /^(?:\s*#{1,6}\s*|\s*\*\*)?(?:python|python solution|python code)\b/i],
    ["solutionJava", "Java Solution", payload.solution.java, /^(?:\s*#{1,6}\s*|\s*\*\*)?(?:java|java solution|java code)\b/i],
    ["solutionCpp", "C++ Solution", payload.solution.cpp, /^(?:\s*#{1,6}\s*|\s*\*\*)?(?:c\+\+|cpp|cxx)(?: solution| code)?\b/i],
    ["solutionJavascript", "JavaScript Solution", payload.solution.javascript, /^(?:\s*#{1,6}\s*|\s*\*\*)?(?:javascript|js)(?: solution| code)?\b/i],
    ["solutionSql", "SQL Solution", payload.solution.sql, /^(?:\s*#{1,6}\s*|\s*\*\*)?(?:sql|sqlite)(?: solution| code)?\b/i],
  ] as const;
  for (const [key, label, value, pattern] of solutions) field(key, label, value, pattern);

  field("timeComplexity", "Time Complexity", payload.complexity.time, /^\s*(?:#{1,6}\s*)?(?:\*\*)?time complexity\b/i);
  field("spaceComplexity", "Space Complexity", payload.complexity.space, /^\s*(?:#{1,6}\s*)?(?:\*\*)?space complexity\b/i);
  field("aiInterviewFocus", "Interview Focus", payload.aiAnalysis.interviewIntent, /^\s*(?:#{1,6}\s*)?(?:\*\*)?(?:interview intent|interview focus)\b/i);
  field("aiKeyConcepts", "Key Concepts", payload.aiAnalysis.keyConcepts, /^\s*(?:#{1,6}\s*)?(?:\*\*)?key concepts\b/i);
  field("aiCommonMistakes", "Common Mistakes", payload.aiAnalysis.commonMistakes, /^\s*(?:#{1,6}\s*)?(?:\*\*)?common mistakes\b/i);
  field("aiFollowUpQuestions", "Follow-up Questions", payload.aiAnalysis.followUpQuestions, /^\s*(?:#{1,6}\s*)?(?:\*\*)?follow[ -]?up(?: questions)?\b/i);
  field("aiBetterStrategy", "Better Answer Strategy", payload.aiAnalysis.betterStrategy, /^\s*(?:#{1,6}\s*)?(?:\*\*)?better(?: answer)? strategy\b/i);

  const issues = validateProblemImportSemantics(payload);
  for (const issue of issues) {
    const message = `${issue.message}${issue.code === "function-name-conflict" ? " Code was left unchanged." : ""}`;
    warnings.push(message);
    for (const candidate of candidates) {
      const affectsFunctionName = issue.code === "function-name-conflict" && candidate.key === "functionName";
      if (candidate.key !== issue.field && !affectsFunctionName) continue;
      candidate.confidence = issue.severity === "error" ? "low" : candidate.confidence === "high" ? "medium" : candidate.confidence;
      candidate.warning = [candidate.warning, message].filter(Boolean).join(" ");
    }
  }

  return { candidates, warnings: [...new Set(warnings)], issues };
}

export function importIssueSummary(issue: ImportValidationIssue) {
  return `${issue.severity.toUpperCase()}: ${issue.message}`;
}

export function summarizeImportCandidate(value: unknown) {
  if (Array.isArray(value)) return `${value.length} item${value.length === 1 ? "" : "s"}`;
  const text = String(value || "").replace(/\s+/g, " ").trim();
  return text.length > 110 ? `${text.slice(0, 107)}…` : text;
}

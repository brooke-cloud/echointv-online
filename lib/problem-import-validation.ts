import type { InterviewImportPayload } from "@/lib/interview-import-schema";
import { primaryFunctionName } from "@/lib/problem-function";

export type ImportedSolutionLanguage = "python" | "java" | "cpp" | "javascript" | "sql";
export type ImportIssueSeverity = "error" | "warning" | "info";
export type ImportValidationIssue = {
  code: string;
  severity: ImportIssueSeverity;
  field: string;
  message: string;
};

export type CodeLanguageScore = {
  language?: ImportedSolutionLanguage;
  confidence: "high" | "medium" | "low";
  scores: Record<ImportedSolutionLanguage, number>;
  reasons: string[];
};

export function classifyImportedCode(code: string, fallback?: ImportedSolutionLanguage): CodeLanguageScore {
  const scores: Record<ImportedSolutionLanguage, number> = { python: 0, java: 0, cpp: 0, javascript: 0, sql: 0 };
  const reasons: string[] = [];
  const score = (language: ImportedSolutionLanguage, pattern: RegExp, weight: number, reason: string) => {
    if (!pattern.test(code)) return;
    scores[language] += weight;
    reasons.push(`${language}: ${reason}`);
  };

  score("cpp", /#include\s*[<"]|\busing\s+namespace\s+std\b|\bstd::|\bvector\s*</, 5, "C++ library syntax");
  score("cpp", /\b(?:int|long|double|bool|string)\s*[*&]+\s*[A-Za-z_]\w*|\bpublic\s*:/, 3, "pointer, reference, or C++ access syntax");
  score("java", /\bimport\s+java\.|\bpackage\s+[\w.]+\s*;|\bSystem\.out\.|\bList\s*</, 5, "Java package or library syntax");
  score("java", /\b(?:int|long|double|boolean|String)\s*\[\s*\]/, 4, "Java array type");
  score("java", /\b(?:public|private|protected)\s+(?:static\s+)?(?:final\s+)?(?:class|interface|enum|[\w<>.?\[\]]+\s+[A-Za-z_]\w*\s*\()/, 3, "Java declaration syntax");
  score("python", /\bfrom\s+\S+\s+import\b|^\s*(?:async\s+)?def\s+\w+\s*\(|\bself\b/m, 5, "Python function or import syntax");
  score("python", /^\s*class\s+\w+(?:\([^)]*\))?\s*:/m, 4, "Python class syntax");
  score("javascript", /\b(?:const|let|var)\s+[A-Za-z_$]\w*\s*=|\bfunction\s+[A-Za-z_$]\w*\s*\(|=>|\bmodule\.exports\b/, 5, "JavaScript declaration syntax");
  score("sql", /\b(?:SELECT|INSERT\s+INTO|CREATE\s+TABLE|UPDATE|DELETE\s+FROM|WITH)\b/i, 5, "SQL statement keyword");

  const ranked = (Object.entries(scores) as Array<[ImportedSolutionLanguage, number]>).sort((left, right) => right[1] - left[1]);
  const winner = ranked[0];
  const runnerUp = ranked[1];
  if (winner[1] >= 5 && winner[1] >= runnerUp[1] + 2) return { language: winner[0], confidence: "high", scores, reasons };
  if (winner[1] >= 3 && winner[1] > runnerUp[1]) return { language: winner[0], confidence: "medium", scores, reasons };
  return { language: fallback, confidence: fallback ? "medium" : "low", scores, reasons };
}

function delimiterIssue(code: string) {
  const pairs: Record<string, string> = { ")": "(", "]": "[", "}": "{" };
  const stack: string[] = [];
  let quote = "";
  let escaped = false;
  let lineComment = false;
  let blockComment = false;
  for (let index = 0; index < code.length; index += 1) {
    const char = code[index];
    const next = code[index + 1];
    if (lineComment) { if (char === "\n") lineComment = false; continue; }
    if (blockComment) { if (char === "*" && next === "/") { blockComment = false; index += 1; } continue; }
    if (quote) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === quote) quote = "";
      continue;
    }
    if (char === "/" && next === "/") { lineComment = true; index += 1; continue; }
    if (char === "/" && next === "*") { blockComment = true; index += 1; continue; }
    if (char === "#") { lineComment = true; continue; }
    if (["\"", "'", "`"].includes(char)) { quote = char; continue; }
    if (["(", "[", "{"].includes(char)) stack.push(char);
    else if (pairs[char]) { if (stack.pop() !== pairs[char]) return `Unexpected “${char}” delimiter.`; }
  }
  if (quote) return "An unterminated string literal was detected.";
  if (blockComment) return "An unterminated block comment was detected.";
  if (stack.length) return `Unclosed “${stack[stack.length - 1]}” delimiter.`;
  return "";
}

function functionNames(language: ImportedSolutionLanguage, code: string) {
  if (language === "python") return [...code.matchAll(/^\s*(?:async\s+)?def\s+([A-Za-z_]\w*)\s*\(/gm)].map((match) => match[1]).filter((name) => !["__init__", "main"].includes(name));
  if (language === "javascript") return [...code.matchAll(/\bfunction\s+([A-Za-z_$]\w*)\s*\(|\b(?:const|let|var)\s+([A-Za-z_$]\w*)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[A-Za-z_$]\w*)\s*=>/g)].map((match) => match[1] || match[2]).filter((name) => name !== "main");
  if (language === "java") return [...code.matchAll(/\b(?:public|protected|private)?\s*(?:static\s+)?[\w<>,.?\[\]]+\s+([A-Za-z_]\w*)\s*\(/g)].map((match) => match[1]).filter((name) => !["main", "Solution"].includes(name));
  if (language === "cpp") return [...code.matchAll(/(?:^|[;}\n])\s*(?:[\w:<>]+[\s*&]+)+([A-Za-z_]\w*)\s*\([^;{}]*\)\s*(?:const\s*)?\{/g)].map((match) => match[1]).filter((name) => name !== "main");
  return [];
}

function signatureParameters(language: ImportedSolutionLanguage, code: string, name: string) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const prefix = language === "python" ? `(?:^|\\n)\\s*(?:async\\s+)?def\\s+${escaped}` : `\\b${escaped}`;
  const match = code.match(new RegExp(`${prefix}\\s*\\(([^)]*)\\)`, language === "python" ? "m" : ""));
  if (!match) return [];
  return match[1].split(",").map((item) => item.trim()).filter(Boolean).map((item) => {
    if (language === "python") return item.replace(/^\*{0,2}/, "").split(/[:=]/)[0].trim();
    return item.replace(/=.*/, "").trim().match(/([A-Za-z_$]\w*)\s*(?:\[\s*\])?$/)?.[1] || "";
  }).filter((name) => name && name !== "self");
}

export function validateProblemImportSemantics(payload: InterviewImportPayload): ImportValidationIssue[] {
  const issues: ImportValidationIssue[] = [];
  const add = (issue: ImportValidationIssue) => issues.push(issue);
  payload.examples.forEach((example, index) => {
    if (!example.input) add({ code: "example-input-missing", severity: "warning", field: "examples", message: `Example ${index + 1} is missing input.` });
    if (!example.output) add({ code: "example-output-missing", severity: "error", field: "examples", message: `Example ${index + 1} is missing output.` });
  });
  const serializedExamples = new Set<string>();
  payload.examples.forEach((example, index) => {
    const fingerprint = `${example.input}\u0000${example.output}`.trim();
    if (fingerprint && serializedExamples.has(fingerprint)) add({ code: "example-duplicate", severity: "warning", field: "examples", message: `Example ${index + 1} duplicates an earlier input/output pair.` });
    serializedExamples.add(fingerprint);
  });

  const declared = payload.functionDescription.functionName ? primaryFunctionName(payload.functionDescription.functionName) : "";
  const declaredParameters = payload.functionDescription.parameters.map((parameter) => parameter.name).filter(Boolean);
  for (const [language, code] of Object.entries(payload.solution) as Array<[ImportedSolutionLanguage, string]>) {
    if (!code.trim()) continue;
    const field = `solution${language[0].toUpperCase()}${language.slice(1)}`;
    const classification = classifyImportedCode(code);
    if (classification.language && classification.language !== language && classification.confidence !== "low") add({ code: "solution-language-mismatch", severity: "error", field, message: `${language} solution looks like ${classification.language} code.` });
    const delimiter = delimiterIssue(code);
    if (delimiter) add({ code: "solution-syntax-delimiter", severity: "error", field, message: `${language} solution: ${delimiter}` });
    const names = functionNames(language, code);
    if (language !== "sql" && !names.length) add({ code: "solution-entry-missing", severity: "warning", field, message: `No callable entry function was detected in the ${language} solution.` });
    if (declared && declared !== "solve" && names.length && !names.includes(declared)) add({ code: "function-name-conflict", severity: "error", field, message: `Function Name is “${declared}”, but the ${language} solution defines ${names.map((name) => `“${name}”`).join(", ")}.` });
    if (declared && declaredParameters.length && names.includes(declared)) {
      const actualParameters = signatureParameters(language, code, declared);
      if (actualParameters.length && actualParameters.join("|") !== declaredParameters.join("|")) add({ code: "function-parameters-conflict", severity: "warning", field, message: `${language} signature parameters (${actualParameters.join(", ")}) do not match Function Description (${declaredParameters.join(", ")}).` });
    }
    if (language === "sql" && !/\b(?:SELECT|INSERT\s+INTO|CREATE\s+TABLE|UPDATE|DELETE\s+FROM|WITH)\b/i.test(code)) add({ code: "sql-statement-missing", severity: "error", field, message: "SQL solution does not contain a recognized SQL statement." });
  }
  if (/\b(?:AI Analysis|Interview Intent|Key Concepts)\b/i.test(payload.complexity.time)) add({ code: "time-complexity-bleed", severity: "error", field: "timeComplexity", message: "Time Complexity appears to contain AI Analysis content." });
  if (/\b(?:AI Analysis|Interview Intent|Key Concepts)\b/i.test(payload.complexity.space)) add({ code: "space-complexity-bleed", severity: "error", field: "spaceComplexity", message: "Space Complexity appears to contain AI Analysis content." });
  return issues;
}

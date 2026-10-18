export type ProblemFunctionParameter = { name: string; type: string; description: string };
export type ProblemFunctionDescription = { functionName: string; parameters: ProblemFunctionParameter[]; returnDescription: string };
export type PracticeLanguage = "Python 3" | "Java" | "C++";
type AvailableSolutions = { solution?: string | null; solutionLanguage?: string | null; solutionPython?: string | null; solutionJava?: string | null; solutionCpp?: string | null };

const clean = (value: unknown) => typeof value === "string" ? value.trim() : "";
const safeIdentifier = (value: string, fallback: string) => /^[A-Za-z_][A-Za-z0-9_]*$/.test(value) ? value : fallback;
const hasNoFixedFunctionName = (value: string) => clean(value).replace(/`/g, "").toLowerCase() === "no fixed function name";

export function primaryFunctionName(value: string) {
  const names = functionNames(value);
  return names.find((name) => /^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) || "solve";
}

export function functionNames(value: string) {
  return clean(value).split(/[,，;；\r\n]+/).map((name) => name.replace(/`/g, "").trim()).filter((name) => /^[A-Za-z_][A-Za-z0-9_]*$/.test(name));
}

export function preferredSolutionLanguage(solutions: AvailableSolutions): PracticeLanguage {
  if (clean(solutions.solutionPython)) return "Python 3";
  if (clean(solutions.solutionJava)) return "Java";
  if (clean(solutions.solutionCpp)) return "C++";

  const legacyCode = clean(solutions.solution);
  if (/\bdef\s+[A-Za-z_]\w*\s*\(|\bimport\s+heapq\b|\bfrom\s+\w+\s+import\b/.test(legacyCode)) return "Python 3";
  if (/#include\s*[<"]|\bvector\s*<|\busing\s+namespace\s+std\b|\bpublic\s*:/.test(legacyCode)) return "C++";
  if (/\bimport\s+java\.|\bPriorityQueue\s*<|\bpublic\s+class\s+/.test(legacyCode)) return "Java";

  const configured = clean(solutions.solutionLanguage).toLowerCase();
  if (/c\+\+|cpp|cxx/.test(configured)) return "C++";
  if (/java/.test(configured)) return "Java";
  return "Python 3";
}

function defaultDescription(name: string, index: number) {
  const normalized = name.toLowerCase();
  if (/^(nums1|arr1|array1|a)$/.test(normalized)) return "First input array.";
  if (/^(nums2|arr2|array2|b)$/.test(normalized)) return "Second input array.";
  if (normalized === "k") return "Number of results to return.";
  return `Input parameter ${index + 1}.`;
}

function normalizeParameter(value: unknown, index: number): ProblemFunctionParameter | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const item = value as Record<string, unknown>;
  const name = clean(item.name) || `arg${index + 1}`;
  const storedType = clean(item.type);
  const storedDescription = clean(item.description);
  return {
    name,
    type: storedType || storedDescription || "unknown",
    description: storedType && storedDescription ? storedDescription : defaultDescription(name, index),
  };
}

export function parseLegacyFunctionParameters(value?: string | null): ProblemFunctionParameter[] {
  const lines = clean(value).split(/\r?\n/).flatMap((line) => line.split(/(?<=[.!?])(?=[A-Za-z_][A-Za-z0-9_]*\s*\|)/)).map((line) => line.replace(/^[-*•]\s*/, "").trim()).filter(Boolean);
  return lines.map((line, index) => {
    const parts = line.split("|").map((part) => part.trim()).filter(Boolean);
    if (parts.length >= 3) return { name: parts[0], type: parts[1] || "unknown", description: parts.slice(2).join(" | ") || defaultDescription(parts[0], index) };
    if (parts.length === 2) return { name: parts[0], type: parts[1] || "unknown", description: defaultDescription(parts[0], index) };
    const colon = line.match(/^([^:：]+)[:：]\s*(.*)$/);
    if (colon) return { name: colon[1].trim(), type: colon[2].trim() || "unknown", description: defaultDescription(colon[1].trim(), index) };
    return { name: line, type: "unknown", description: defaultDescription(line, index) };
  });
}

export function normalizeProblemFunctionDescription(value: unknown, legacy?: { functionName?: string | null; functionParameters?: string | null; returnDescription?: string | null }): ProblemFunctionDescription {
  const input = value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
  const functionName = clean(input.functionName) || clean(legacy?.functionName) || "solve";
  const structured = Array.isArray(input.parameters) ? input.parameters.map(normalizeParameter).filter((parameter): parameter is ProblemFunctionParameter => Boolean(parameter)) : [];
  return {
    functionName,
    parameters: structured.length ? structured : parseLegacyFunctionParameters(legacy?.functionParameters),
    returnDescription: clean(input.returnDescription) || clean(legacy?.returnDescription),
  };
}

function javaType(type: string) {
  const normalized = type.toLowerCase();
  if (/integer.*array|array.*integer|int\[\]/.test(normalized)) return "int[]";
  if (/string.*array|array.*string/.test(normalized)) return "String[]";
  if (/integer|\bint\b/.test(normalized)) return "int";
  if (/boolean|\bbool\b/.test(normalized)) return "boolean";
  if (/string/.test(normalized)) return "String";
  return "Object";
}

function cppType(type: string) {
  const normalized = type.toLowerCase();
  if (/integer.*array|array.*integer|int\[\]/.test(normalized)) return "vector<int>&";
  if (/string.*array|array.*string/.test(normalized)) return "vector<string>&";
  if (/integer|\bint\b/.test(normalized)) return "int";
  if (/boolean|\bbool\b/.test(normalized)) return "bool";
  if (/string/.test(normalized)) return "string";
  return "auto";
}

export function createPracticeTemplates(description: ProblemFunctionDescription, references?: { python?: string | null; java?: string | null; cpp?: string | null }): Record<PracticeLanguage, string> {
  if (hasNoFixedFunctionName(description.functionName)) {
    return {
      "Python 3": "# Write your solution here\n",
      Java: "// Write your solution here\n",
      "C++": "// Write your solution here\n",
    };
  }

  const declaredNames = functionNames(description.functionName);
  const namesToRender = declaredNames.length ? declaredNames : ["solve"];
  const names = description.parameters.map((parameter, index) => safeIdentifier(parameter.name, `arg${index + 1}`));
  const pythonParameters = names.join(", ");
  const javaParameters = description.parameters.map((parameter, index) => `${javaType(parameter.type)} ${names[index]}`).join(", ");
  const cppParameters = description.parameters.map((parameter, index) => `${cppType(parameter.type)} ${names[index]}`).join(", ");
  const escaped = (name: string) => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const signatureParameters = (code: string | null | undefined, name: string, fallback: string, language: PracticeLanguage) => {
    if (!code) return fallback;
    const prefix = language === "Python 3" ? `(?:^|\\n)\\s*(?:async\\s+)?def\\s+${escaped(name)}` : `\\b${escaped(name)}`;
    return code.match(new RegExp(`${prefix}\\s*\\(([^)]*)\\)`, language === "Python 3" ? "m" : ""))?.[1]?.trim() || fallback;
  };
  const pythonTemplate = namesToRender.map((name) => `def ${name}(${signatureParameters(references?.python, name, pythonParameters, "Python 3")}):\n    # Write your solution here\n    pass`).join("\n\n");
  const javaMethods = namesToRender.map((name) => `    public Object ${name}(${signatureParameters(references?.java, name, javaParameters, "Java")}) {\n        // Write your solution here\n        return null;\n    }`).join("\n\n");
  const cppFunctions = namesToRender.map((name) => `auto ${name}(${signatureParameters(references?.cpp, name, cppParameters, "C++")}) {\n    // Write your solution here\n}`).join("\n\n");
  return {
    "Python 3": `${pythonTemplate}\n`,
    Java: `class Solution {\n${javaMethods}\n}\n`,
    "C++": `#include <bits/stdc++.h>\nusing namespace std;\n\n${cppFunctions}\n`,
  };
}

export function alignSolutionFunctionName(code: string, functionName: string, language: PracticeLanguage) {
  const entryFunctionName = primaryFunctionName(functionName);
  if (!code.trim() || entryFunctionName === "solve") return code;
  const targetPattern = new RegExp(`\\b${entryFunctionName}\\s*\\(`);
  if (targetPattern.test(code)) return code;
  if (language === "Python 3") return code.replace(/\bdef\s+solve\s*\(/, `def ${entryFunctionName}(`);
  return code.replace(/\bsolve\s*\(/, `${entryFunctionName}(`);
}

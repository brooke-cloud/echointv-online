export type ProblemFunctionParameter = { name: string; type: string; description: string };
export type ProblemFunctionDescription = { functionName: string; parameters: ProblemFunctionParameter[]; returnDescription: string };
export type PracticeLanguage = "Python 3" | "Java" | "C++";

const clean = (value: unknown) => typeof value === "string" ? value.trim() : "";
const safeIdentifier = (value: string, fallback: string) => /^[A-Za-z_][A-Za-z0-9_]*$/.test(value) ? value : fallback;

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
  const functionName = safeIdentifier(clean(input.functionName) || clean(legacy?.functionName) || "solve", "solve");
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

export function createPracticeTemplates(description: ProblemFunctionDescription): Record<PracticeLanguage, string> {
  const functionName = description.functionName || "solve";
  const names = description.parameters.map((parameter, index) => safeIdentifier(parameter.name, `arg${index + 1}`));
  const pythonParameters = names.join(", ");
  const javaParameters = description.parameters.map((parameter, index) => `${javaType(parameter.type)} ${names[index]}`).join(", ");
  const cppParameters = description.parameters.map((parameter, index) => `${cppType(parameter.type)} ${names[index]}`).join(", ");
  return {
    "Python 3": `def ${functionName}(${pythonParameters}):\n    # Write your solution here\n    pass\n`,
    Java: `class Solution {\n    public Object ${functionName}(${javaParameters}) {\n        // Write your solution here\n        return null;\n    }\n}\n`,
    "C++": `class Solution {\npublic:\n    auto ${functionName}(${cppParameters}) {\n        // Write your solution here\n        return {};\n    }\n};\n`,
  };
}

export function alignSolutionFunctionName(code: string, functionName: string, language: PracticeLanguage) {
  if (!code.trim() || !functionName || functionName === "solve") return code;
  const targetPattern = new RegExp(`\\b${functionName}\\s*\\(`);
  if (targetPattern.test(code)) return code;
  if (language === "Python 3") return code.replace(/\bdef\s+solve\s*\(/, `def ${functionName}(`);
  return code.replace(/\bsolve\s*\(/, `${functionName}(`);
}

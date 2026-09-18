import hljs from "highlight.js/lib/core";
import python from "highlight.js/lib/languages/python";
import java from "highlight.js/lib/languages/java";
import cpp from "highlight.js/lib/languages/cpp";
import c from "highlight.js/lib/languages/c";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import go from "highlight.js/lib/languages/go";
import rust from "highlight.js/lib/languages/rust";
import sql from "highlight.js/lib/languages/sql";

export const LANGUAGE_LABELS = {
  python: "Python 3", java: "Java", cpp: "C++", c: "C",
  javascript: "JavaScript", typescript: "TypeScript", go: "Go",
  rust: "Rust", sql: "SQL", plaintext: "未识别语言",
} as const;
export type SolutionLanguage = keyof typeof LANGUAGE_LABELS;

// Use a private instance so detection does not change another component's configuration.
const highlighter = hljs.newInstance();
const grammars = { python, java, cpp, c, javascript, typescript, go, rust, sql };
for (const [name, grammar] of Object.entries(grammars)) {
  highlighter.registerLanguage(name, grammar);
}

const aliases: Record<string, SolutionLanguage> = {
  py: "python", python3: "python", "python 3": "python",
  "c++": "cpp", cxx: "cpp", cc: "cpp", js: "javascript", jsx: "javascript",
  ts: "typescript", tsx: "typescript", golang: "go", rs: "rust",
  text: "plaintext", txt: "plaintext", plain: "plaintext",
};

export function normalizeSolutionLanguage(value?: string | null): SolutionLanguage | undefined {
  const key = value?.trim().toLowerCase().replace(/^language-/, "") || "";
  if (Object.prototype.hasOwnProperty.call(LANGUAGE_LABELS, key)) {
    return key as SolutionLanguage;
  }
  return Object.prototype.hasOwnProperty.call(aliases, key) ? aliases[key] : undefined;
}

function unwrapSolution(source: string) {
  const trimmed = source.replace(/\r\n?/g, "\n").trim();
  const lines = trimmed.split("\n");
  const opening = lines[0]?.match(/^(`{3,}|~{3,})\s*([^\s]*)\s*$/);
  if (opening) {
    const fence = opening[1];
    const closing = new RegExp(`^\\s*${fence[0]}{${fence.length},}\\s*$`);
    const closeIndex = lines.findIndex((line, index) => index > 0 && closing.test(line));
    // Only unwrap a single complete block; never truncate multiple solutions or prose.
    if (closeIndex === lines.length - 1 && closeIndex > 0) {
      return { code: lines.slice(1, -1).join("\n"), fenceLanguage: normalizeSolutionLanguage(opening[2]) };
    }
  }
  return { code: source, fenceLanguage: undefined };
}

function detectSyntax(code: string): SolutionLanguage | undefined {
  // Exclude comments and string contents from language signatures.
  const syntax = code.replace(
    /"""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*'|`(?:\\[\s\S]|[^`\\])*`|\/\*[\s\S]*?\*\/|\/\/[^\n]*|^[ \t]*#(?!\s*(?:include|define|if|endif|pragma)\b)[^\n]*/gm,
    (match) => match.replace(/[^\n]/g, " "),
  );
  if (/\bimport\s+(?:static\s+)?(?:java|javax)\.|\bSystem\.out\.|\bpublic\s+(?:(?:abstract|final)\s+)?class\s+\w+|\b(?:public|private|protected)\s+static\s+\w+/.test(syntax)) return "java";
  if (/^\s*(?:async\s+)?def\s+\w+\s*\(|^\s*from\s+[\w.]+\s+import\b|^\s*class\s+\w+(?:\([^\n]*\))?\s*:/m.test(syntax)) return "python";
  if (/\bstd::|\busing\s+namespace\s+std\b|\btemplate\s*<|#include\s*<(?:iostream|vector|bits\/stdc\+\+\.h)>/.test(syntax)) return "cpp";
  if (/\bfunc\s+(?:\([^\n]*\)\s*)?\w+\s*\(|^\s*package\s+\w+/m.test(syntax)) return "go";
  if (/\b(?:pub\s+)?fn\s+\w+\s*\(|\bimpl\s+\w+|\blet\s+mut\b|\b(?:println|vec)!/.test(syntax)) return "rust";
  if (/\b(?:interface|type)\s+\w+\s*(?:[<{=])|\b(?:const|let)\s+\w+\s*:\s*\w+|[,(]\s*\w+\??\s*:\s*(?:number|string|boolean|unknown|never)\b|\)\s*:\s*(?:number|string|boolean|void|Promise)\b/.test(syntax)) return "typescript";
  if (/\b(?:function\s+\w+\s*\(|(?:const|let|var)\s+\w+\s*=)|=>|\bconsole\.log\s*\(/.test(syntax)) return "javascript";
  if (/#include\s*<(?:stdio|stdlib|string)\.h>/.test(syntax)) return "c";
  if (/\bSELECT\b[\s\S]+\bFROM\b|\bCREATE\s+TABLE\b|\bINSERT\s+INTO\b/i.test(syntax)) return "sql";
  return undefined;
}

/** Distinctive syntax > fence > supplied language > confident grammar detection > plain text. */
export function resolveSolution(source: string, hint?: string | null) {
  const { code, fenceLanguage } = unwrapSolution(source);
  const hintLanguage = fenceLanguage ?? normalizeSolutionLanguage(hint);
  const normalizedHint = hintLanguage === "plaintext" ? undefined : hintLanguage;
  let language: SolutionLanguage | undefined;
  if (code.trim()) {
    language = detectSyntax(code);
    // JavaScript is valid TypeScript, and C fragments can also be valid C++.
    if (language === "javascript" && normalizedHint === "typescript") language = "typescript";
    if (language === "c" && normalizedHint === "cpp") language = "cpp";
    language ||= normalizedHint;
    if (!language) {
      const result = highlighter.highlightAuto(code, Object.keys(grammars));
      const margin = result.relevance - (result.secondBest?.relevance || 0);
      if (result.relevance >= 5 && margin >= 2) {
        language = normalizeSolutionLanguage(result.language);
      }
    }
  }
  language ||= "plaintext";
  const label = LANGUAGE_LABELS[language];
  return {
    code, language, label,
    heading: language === "plaintext" ? "Solution (代码解答)" : `Solution (${label} 最优解)`,
    title: language === "plaintext" ? "Solution" : `${label} Solution`,
  };
}

export function highlightSolution(code: string, language: SolutionLanguage): string | null {
  if (language === "plaintext") return null;
  try {
    return highlighter.highlight(code, { language, ignoreIllegals: true }).value;
  } catch {
    return null;
  }
}

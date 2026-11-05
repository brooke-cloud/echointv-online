export function splitComplexityContent(value: string, fallbackValue: string, fallbackExplanation: string) {
  const normalized = (value || "").replace(/`/g, "").replace(/\s*#{1,6}\s*\d+[.)]?\s*AI Analysis[\s\S]*$/i, "").trim();
  if (!normalized) return { value: fallbackValue, explanation: fallbackExplanation };

  const lines = normalized.split(/\r?\n/);
  const firstLineIsTableHeader = lines[0]?.includes("|");
  const secondLineIsTableDelimiter = (() => {
    const delimiter = (lines[1] || "").trim().replace(/^\|/, "").replace(/\|$/, "");
    const cells = delimiter.split("|").map((cell) => cell.trim());
    return cells.length >= 2 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
  })();
  if (firstLineIsTableHeader && secondLineIsTableDelimiter) return { value: "", explanation: normalized };

  if (/^O\s*\(/i.test(normalized)) {
    const start = normalized.indexOf("(");
    let depth = 0;
    for (let index = start; index < normalized.length; index += 1) {
      if (normalized[index] === "(") depth += 1;
      if (normalized[index] === ")") depth -= 1;
      if (depth === 0) return { value: normalized.slice(0, index + 1).trim(), explanation: normalized.slice(index + 1).trim() || fallbackExplanation };
    }
  }
  const [first, ...rest] = lines.map((line) => line.trim()).filter(Boolean);
  return { value: first || fallbackValue, explanation: rest.join("\n") || fallbackExplanation };
}

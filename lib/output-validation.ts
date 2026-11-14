export function normalizeProgramOutput(value: string): string {
  return value
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/g, ""))
    .join("\n")
    .trim();
}

export function executionMatchesExpected(success: boolean, actual: string, expected: string): boolean {
  if (!success || !expected.trim()) return false;
  return normalizeProgramOutput(actual) === normalizeProgramOutput(expected);
}

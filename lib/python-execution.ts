function hasMainGuardOnLine(line: string) {
  return /^\s*if\s+(?:__name__\s*==\s*(["'])__main__\1|(["'])__main__\2\s*==\s*__name__)\s*:/.test(line);
}

/**
 * A solution with a Python main guard is a complete executable program. In
 * that mode the practice runner must not call the configured function again.
 */
export function shouldAutoInvokePython(code: string) {
  let tripleQuote: "'''" | '\"\"\"' | null = null;

  for (const line of code.split(/\r?\n/)) {
    let visible = "";
    let cursor = 0;

    while (cursor < line.length) {
      if (tripleQuote) {
        const closing = line.indexOf(tripleQuote, cursor);
        if (closing === -1) {
          cursor = line.length;
          continue;
        }
        cursor = closing + 3;
        tripleQuote = null;
        continue;
      }

      const single = line.indexOf("'''", cursor);
      const double = line.indexOf('\"\"\"', cursor);
      const opening = single === -1 ? double : double === -1 ? single : Math.min(single, double);
      if (opening === -1) {
        visible += line.slice(cursor);
        break;
      }

      visible += line.slice(cursor, opening);
      tripleQuote = line.slice(opening, opening + 3) as "'''" | '\"\"\"';
      cursor = opening + 3;
    }

    if (hasMainGuardOnLine(visible)) return false;
  }

  return true;
}

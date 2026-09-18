import assert from "node:assert/strict";
import test from "node:test";
import { highlightSolution, normalizeSolutionLanguage, resolveSolution } from "./solution-language";

const javaCode = `import java.util.ArrayList;
import java.util.List;
public class TimeSeriesMerger {
    public static List<int[]> mergeTimeSeries(int[][] a, int[][] b) {
        List<int[]> result = new ArrayList<>(); // 保存最终合并后的时间序列
        return result;
    }
}`;

test("existing Java solution overrides the legacy Python default in both titles and highlighting", () => {
  const result = resolveSolution(javaCode, "python");
  assert.equal(result.language, "java");
  assert.equal(result.heading, "Solution (Java 最优解)");
  assert.equal(result.title, "Java Solution");
  assert.equal(result.code, javaCode);
  assert.match(highlightSolution(result.code, result.language)!, /hljs-keyword/);
  assert.match(highlightSolution(result.code, result.language)!.replace(/<[^>]*>/g, ""), /List&lt;/);
});

const samples = {
  python: 'def merge(a, b):\n    return sorted(a + b)',
  java: javaCode,
  cpp: '#include <vector>\nstd::vector<int> merge() { return {}; }',
  c: '#include <stdio.h>\nint main(void) { printf("hello"); return 0; }',
  javascript: 'function merge(a, b) { return [...a, ...b]; }',
  typescript: 'function merge(a: number[], b: number[]): number[] { return [...a, ...b]; }',
  go: 'func merge(a []int, b []int) []int { return append(a, b...) }',
  rust: 'pub fn merge(a: Vec<i32>, b: Vec<i32>) -> Vec<i32> { a }',
  sql: 'SELECT company, COUNT(*) FROM problems GROUP BY company;',
};
for (const [language, code] of Object.entries(samples)) {
  test(`detect ${language} from code without a fence`, () => {
    assert.equal(resolveSolution(code).language, language);
    assert.equal(resolveSolution(code, "python").language, language);
  });
}

test("single Markdown fences support aliases, CRLF and tilde fences without losing indentation", () => {
  const result = resolveSolution('```Java\r\n    return value;\r\n```', "python");
  assert.equal(result.language, "java");
  assert.equal(result.code, '    return value;');
  assert.equal(resolveSolution('~~~c++\nreturn 1;\n~~~').language, "cpp");
  assert.equal(resolveSolution('```ts\nconst x = 1;\n```').language, "typescript");
  assert.equal(normalizeSolutionLanguage("language-PY"), "python");
});

test("language names in comments and strings do not misclassify Java as JavaScript", () => {
  const code = '// Compare JavaScript and Rust\n' + javaCode.replace('return result;', 'String label = "typescript";\n        return result;');
  assert.equal(resolveSolution(code).language, "java");
  assert.equal(resolveSolution('def f():\n    return "public class Fake {}"').language, "python");
});

test("Java syntax corrects an incorrectly labeled Python Markdown fence", () => {
  assert.equal(resolveSolution('```python\n' + javaCode + '\n```', 'python').language, 'java');
});

test("do not silently truncate multiple fenced solutions or text outside a fence", () => {
  const source = '```java\nclass A {}\n```\nExplanation\n```python\npass\n```';
  assert.equal(resolveSolution(source).code, source);
});

test("ambiguous code can use a hint; unknown and empty code do not default to Python", () => {
  assert.equal(resolveSolution('return result;', "java").language, "java");
  assert.equal(resolveSolution('return result;').language, "plaintext");
  assert.equal(resolveSolution('').language, "plaintext");
  assert.equal(resolveSolution('', "python").language, "plaintext");
  assert.equal(resolveSolution('这是一段解题说明').title, "Solution");
  assert.equal(resolveSolution(samples.java, "plaintext").language, "java");
  assert.equal(normalizeSolutionLanguage('__proto__'), undefined);
});

test("retain explicit TypeScript/C++ hints for syntax also valid in JavaScript/C", () => {
  assert.equal(resolveSolution('const x = 1;', 'typescript').language, 'typescript');
  assert.equal(resolveSolution(samples.c, 'cpp').language, 'cpp');
});

test("code resembling HTML is escaped in highlighted output, or rendered as plain text", () => {
  const html = highlightSolution('String value = "<img src=x onerror=alert(1)>";', "java")!;
  assert.ok(!html.includes('<img'));
  assert.ok(html.includes('&lt;img'));
  assert.equal(highlightSolution('<img src=x>', "plaintext"), null);
});

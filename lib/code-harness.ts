import type { JudgeLanguage } from "./judge0";

type Parameter = { name: string; type: string };
const identifier = /^[A-Za-z_][A-Za-z0-9_]*$/;

function assignments(input: string) {
  const result = new Map<string, string>();
  const lines = input.split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(/^\s*([A-Za-z_]\w*)\s*=\s*(.*)$/);
    if (!match) continue;
    let value = match[2].trim();
    let balance = [...value].reduce((sum, char) => sum + ("[({".includes(char) ? 1 : "])}".includes(char) ? -1 : 0), 0);
    while (balance > 0 && index + 1 < lines.length) {
      index += 1; value += `\n${lines[index].trim()}`;
      balance = [...value].reduce((sum, char) => sum + ("[({".includes(char) ? 1 : "])}".includes(char) ? -1 : 0), 0);
    }
    result.set(match[1], value.replace(/\bTrue\b/g, "true").replace(/\bFalse\b/g, "false").replace(/\bNone\b/g, "null"));
  }
  return result;
}

function typeKind(type: string) {
  const value = type.toLowerCase().replace(/\s/g, "");
  const nested = /(?:list|array|vector).*(?:list|array|vector)|\[\]\[\]|\[\[/.test(value);
  const array = nested || /(?:list|array|vector)|\[\]/.test(value);
  const string = /string|str/.test(value);
  const boolean = /bool/.test(value);
  const floating = /float|double|decimal/.test(value);
  return { nested, array, string, boolean, floating };
}

function javaDeclaration(parameter: Parameter, value: string) {
  const kind = typeKind(parameter.type);
  const base = kind.string ? "String" : kind.boolean ? "boolean" : kind.floating ? "double" : "int";
  if (kind.nested) return `${base}[][] ${parameter.name} = new ${base}[][]${value.replace(/^\[/, "{").replace(/\]$/, "}").replace(/\[/g, "{").replace(/\]/g, "}")};`;
  if (kind.array) return `${base}[] ${parameter.name} = new ${base}[]${value.replace(/^\[/, "{").replace(/\]$/, "}")};`;
  return `${base} ${parameter.name} = ${value};`;
}

function cppDeclaration(parameter: Parameter, value: string) {
  const kind = typeKind(parameter.type);
  const base = kind.string ? "string" : kind.boolean ? "bool" : kind.floating ? "double" : "int";
  if (kind.nested) return `vector<vector<${base}>> ${parameter.name} = ${value.replace(/\[/g, "{").replace(/\]/g, "}")};`;
  if (kind.array) return `vector<${base}> ${parameter.name} = ${value.replace(/\[/g, "{").replace(/\]/g, "}")};`;
  return `${base} ${parameter.name} = ${value};`;
}

function javaHarness(code: string, functionName: string, parameters: Parameter[], values: Map<string, string>) {
  const declarations = parameters.map((parameter) => javaDeclaration(parameter, values.get(parameter.name) || "null")).join("\n        ");
  const call = `new Solution().${functionName}(${parameters.map((item) => item.name).join(", ")})`;
  const main = `\n    public static void main(String[] args) {\n        ${declarations}\n        Object result = ${call};\n        if (result != null && result.getClass().isArray()) {\n            if (result instanceof Object[]) System.out.println(java.util.Arrays.deepToString((Object[]) result));\n            else if (result instanceof int[]) System.out.println(java.util.Arrays.toString((int[]) result));\n            else if (result instanceof long[]) System.out.println(java.util.Arrays.toString((long[]) result));\n            else if (result instanceof double[]) System.out.println(java.util.Arrays.toString((double[]) result));\n            else if (result instanceof boolean[]) System.out.println(java.util.Arrays.toString((boolean[]) result));\n        } else if (result != null) System.out.println(result);\n    }\n`;
  return `${code}\nclass Main {${main}}\n`;
}

function cppHarness(code: string, functionName: string, parameters: Parameter[], values: Map<string, string>) {
  const declarations = parameters.map((parameter) => cppDeclaration(parameter, values.get(parameter.name) || "{}" )).join("\n    ");
  const helpers = `\ntemplate <typename T> void echoPrint(const T& value) { cout << value; }\ntemplate <typename T> void echoPrint(const vector<T>& values) { cout << "["; for (size_t i = 0; i < values.size(); ++i) { if (i) cout << ", "; echoPrint(values[i]); } cout << "]"; }\n`;
  return `${code}${helpers}\nint main() {\n    ${declarations}\n    auto result = ${functionName}(${parameters.map((item) => item.name).join(", ")});\n    echoPrint(result);\n    cout << endl;\n    return 0;\n}\n`;
}

export function buildJudgeSource(language: JudgeLanguage, code: string, input: string, functionName: string, parameters: Parameter[]) {
  if (!identifier.test(functionName) || !parameters.every((item) => identifier.test(item.name))) return { sourceCode: code, stdin: input };
  const values = assignments(input);
  if (parameters.some((item) => !values.has(item.name))) return { sourceCode: code, stdin: input };
  return { sourceCode: language === "Java" ? javaHarness(code, functionName, parameters, values) : cppHarness(code, functionName, parameters, values), stdin: "" };
}

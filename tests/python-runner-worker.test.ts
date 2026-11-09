import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const workerSource = readFileSync(new URL("../public/python-runner.worker.js", import.meta.url), "utf8");
let executedSource = "";
let posted: { output?: string; success?: boolean } | undefined;
const pyodide = {
  setStdout() {},
  setStderr() {},
  async runPythonAsync(source: string) { executedSource = source; },
};
const workerSelf = {
  loadPyodide: async () => pyodide,
  postMessage(value: { output?: string; success?: boolean }) { posted = value; },
  onmessage: undefined as undefined | ((event: { data: Record<string, unknown> }) => Promise<void>),
};

vm.runInNewContext(workerSource, { self: workerSelf, importScripts() {} });
assert.ok(workerSelf.onmessage, "worker message handler should be installed");

const completeScript = `def formatText(texts, width):
    return texts

if __name__ == "__main__":
    for line in formatText(["hello"], 16):
        print(line)`;

async function main() {
  await workerSelf.onmessage!({ data: {
    code: completeScript,
    input: 'texts = ["hello"]\nwidth = 16',
    functionName: "formatText",
    parameters: ["texts", "width"],
    autoInvoke: false,
  } });
  assert.equal(executedSource, completeScript, "complete scripts must execute without an appended harness");
  assert.equal(posted?.success, true);

  await workerSelf.onmessage!({ data: {
    code: "def formatText(texts, width):\n    return texts",
    input: 'texts = ["hello"]\nwidth = 16',
    functionName: "formatText",
    parameters: ["texts", "width"],
    autoInvoke: true,
  } });
  assert.match(executedSource, /# EchoINTV practice runner/);
  assert.match(executedSource, /__echointv_result = formatText\(texts, width\)/);

  console.log("python runner worker integration tests passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

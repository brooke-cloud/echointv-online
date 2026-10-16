const PYODIDE_URL = "https://cdn.jsdelivr.net/pyodide/v0.27.7/full/";
let runtimePromise;

async function getRuntime() {
  if (!runtimePromise) {
    importScripts(`${PYODIDE_URL}pyodide.js`);
    runtimePromise = self.loadPyodide({ indexURL: PYODIDE_URL });
  }
  return runtimePromise;
}

self.onmessage = async (event) => {
  const { code, input, functionName, parameters } = event.data || {};
  const stdout = [];
  const stderr = [];
  try {
    const pyodide = await getRuntime();
    pyodide.setStdout({ batched: (value) => stdout.push(value) });
    pyodide.setStderr({ batched: (value) => stderr.push(value) });
    const validFunction = typeof functionName === "string" && /^[A-Za-z_]\w*$/.test(functionName);
    const validParameters = Array.isArray(parameters) && parameters.every((item) => typeof item === "string" && /^[A-Za-z_]\w*$/.test(item));
    const inputLines = typeof input === "string" ? input.split(/\r?\n/).filter((line) => line.trim()) : [];
    const harness = validFunction && validParameters
      ? `\n\n# EchoINTV practice runner\n${inputLines.join("\n")}\n__echointv_result = ${functionName}(${parameters.join(", ")})\nif __echointv_result is not None:\n    print(__echointv_result)\n`
      : "";
    await pyodide.runPythonAsync(`${code}${harness}`);
    self.postMessage({ output: [...stdout, ...stderr].join("\n").trim() || "Program completed without output.", success: stderr.length === 0 });
  } catch (error) {
    self.postMessage({ output: [...stdout, ...stderr, error instanceof Error ? error.message : String(error)].filter(Boolean).join("\n").trim(), success: false });
  }
};

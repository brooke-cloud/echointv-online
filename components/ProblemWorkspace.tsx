"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import Link from "next/link";
import { Bookmark, BrainCircuit, Check, ChevronLeft, Copy, Expand, Lightbulb, GripVertical, Minimize2, Moon, Play, RotateCcw, Save, Sun, TerminalSquare } from "lucide-react";
import { alignSolutionFunctionName, createPracticeTemplates, preferredSolutionLanguage, primaryFunctionName, type PracticeLanguage, type ProblemFunctionDescription, type ReferenceSolutionLanguage } from "@/lib/problem-function";
import MarkdownRenderer from "@/components/MarkdownRenderer";

type Props = { problem: { slug: string; title: string; company: string; difficulty: string; category: string; description: string; example: string; approach: string; solution: string; solutionLanguage?: string; topics: string[]; timeComplexity: string; spaceComplexity: string; examples?: { input: string; output: string; explanation: string }[]; functionDescription: ProblemFunctionDescription; constraints?: string[]; approachHowToThink?: string; approachObservations?: string; approachSteps?: string; solutionPython?: string; solutionJava?: string; solutionCpp?: string; solutionJavascript?: string; aiInterviewFocus?: string; aiKeyConcepts?: string; aiCommonMistakes?: string; aiFollowUpQuestions?: string; aiBetterStrategy?: string }; canAccess: boolean; problemId?: number; initialSolved?: boolean; initialFavorited?: boolean };
const examples = [{ name: "Example 1", input: "A = [[1, 2], [4, 5]]\nB = [[1, 4], [3, 6]]", output: "[[1, 6], [3, 6], [4, 5]]", explanation: "Merge observations in chronological order." }, { name: "Example 2", input: "A = [[1, 1]]\nB = [[1, 2]]", output: "[[1, 3]]", explanation: "Combine values that share the same timestamp." }, { name: "Empty Input", input: "A = []\nB = [[3, 7]]", output: "[[3, 7]]", explanation: "Return the non-empty series unchanged." }];
const editorLanguage = (language: string) => language === "Python 3" ? "python" : language === "C++" ? "cpp" : language === "JavaScript" ? "javascript" : "java";
const difficultyStyle = (value: string) => value.toLowerCase() === "easy" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : value.toLowerCase() === "hard" ? "border-rose-200 bg-rose-50 text-rose-700" : "border-amber-200 bg-amber-50 text-amber-700";
function Sample({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) { return <pre className={`overflow-x-auto rounded-xl border p-4 font-mono text-[15px] font-semibold leading-7 ${dark ? "border-slate-700 bg-slate-950 text-slate-100" : "border-slate-200 bg-slate-50 text-slate-900"}`}><code>{children}</code></pre>; }

function splitComplexity(value: string, fallbackValue: string, fallbackExplanation: string) {
  const normalized = (value || "").replace(/`/g, "").replace(/\s*#{1,6}\s*\d+[.)]?\s*AI Analysis[\s\S]*$/i, "").trim();
  if (!normalized) return { value: fallbackValue, explanation: fallbackExplanation };
  if (/^O\s*\(/i.test(normalized)) {
    const start = normalized.indexOf("(");
    let depth = 0;
    for (let index = start; index < normalized.length; index += 1) {
      if (normalized[index] === "(") depth += 1;
      if (normalized[index] === ")") depth -= 1;
      if (depth === 0) return { value: normalized.slice(0, index + 1).trim(), explanation: normalized.slice(index + 1).trim() || fallbackExplanation };
    }
  }
  const [first, ...rest] = normalized.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  return { value: first || fallbackValue, explanation: rest.join("\n") || fallbackExplanation };
}

function runPython(code: string, input: string, functionName: string, parameters: string[]) {
  return new Promise<{ output: string; success: boolean }>((resolve, reject) => {
    const worker = new Worker("/python-runner.worker.js");
    const timeout = window.setTimeout(() => { worker.terminate(); reject(new Error("Execution timed out after 10 seconds.")); }, 10_000);
    worker.onmessage = (event) => { window.clearTimeout(timeout); worker.terminate(); resolve(event.data); };
    worker.onerror = () => { window.clearTimeout(timeout); worker.terminate(); reject(new Error("Python runtime failed to load.")); };
    worker.postMessage({ code, input, functionName, parameters });
  });
}

async function runJudge0(
  language: "Java" | "C++" | "JavaScript",
  code: string,
  input: string,
  functionName: string,
  parameters: { name: string; type: string }[],
) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 22_000);
  try {
    const response = await fetch("/api/code/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      signal: controller.signal,
      body: JSON.stringify({ language, code, input, functionName, parameters }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(typeof result.error === "string" ? result.error : "Code execution failed.");
    return result as { output: string; success: boolean; status: string };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw new Error("Judge0 execution timed out.");
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}

export default function ProblemWorkspace({ problem, canAccess, problemId, initialSolved = false, initialFavorited = false }: Props) {
  const primaryTabs = ["Problem", "Approach", "Solution", "Complexity", "AI Analysis"];
  const consoleTabs = ["Examples", "Output", "Custom Test", "Run History"];
  const defaultSolutionLanguage = preferredSolutionLanguage(problem);
  const practiceTemplates = useMemo(() => createPracticeTemplates(problem.functionDescription, {
    python: problem.solutionPython || (defaultSolutionLanguage === "Python 3" ? problem.solution : undefined),
    java: problem.solutionJava || (defaultSolutionLanguage === "Java" ? problem.solution : undefined),
    cpp: problem.solutionCpp || (defaultSolutionLanguage === "C++" ? problem.solution : undefined),
    javascript: problem.solutionJavascript || (defaultSolutionLanguage === "JavaScript" ? problem.solution : undefined),
  }), [problem.functionDescription, problem.solution, problem.solutionPython, problem.solutionJava, problem.solutionCpp, problem.solutionJavascript, defaultSolutionLanguage]);
  const [tab, setTab] = useState("Problem"); const [language, setLanguage] = useState<PracticeLanguage>("Python 3"); const [code, setCode] = useState(() => practiceTemplates["Python 3"]); const [solutionLanguage, setSolutionLanguage] = useState<ReferenceSolutionLanguage>(() => defaultSolutionLanguage); const [dark, setDark] = useState(false); const [full, setFull] = useState(false); const [consoleTab, setConsoleTab] = useState("Examples"); const [example, setExample] = useState(0); const [customInput, setCustomInput] = useState(""); const [completed, setCompleted] = useState(false); const [solved, setSolved] = useState(initialSolved); const [favorited, setFavorited] = useState(initialFavorited); const [savingFavorite, setSavingFavorite] = useState(false); const [running, setRunning] = useState(false); const [outputMessage, setOutputMessage] = useState(""); const [hint, setHint] = useState(0); const [notes, setNotes] = useState(""); const [saved, setSaved] = useState(false); const [copied, setCopied] = useState(false); const [leftWidth, setLeftWidth] = useState(50); const workspaceRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLElement>(null); const [consoleHeight, setConsoleHeight] = useState(300);
  const notesKey = `echointv-practice-notes:${problem.slug}`; const activeExamples = problem.examples?.length ? problem.examples : examples; const selected = activeExamples[example] || activeExamples[0]; const languageSolution = solutionLanguage === "Python 3" ? problem.solutionPython : solutionLanguage === "Java" ? problem.solutionJava : solutionLanguage === "C++" ? problem.solutionCpp : problem.solutionJavascript; const rawSolution = languageSolution || (solutionLanguage === defaultSolutionLanguage ? problem.solution : undefined); const fallbackSolution = solutionLanguage === "JavaScript" ? "// Write your solution here\n" : practiceTemplates[solutionLanguage]; const solution = alignSolutionFunctionName(rawSolution || fallbackSolution, problem.functionDescription.functionName, solutionLanguage);
  const practiceFunctionName = primaryFunctionName(problem.functionDescription.functionName);
  const visibleParameters = problem.functionDescription.parameters.filter((parameter) => parameter.name.trim() || parameter.type.trim() || parameter.description.trim());
  const categoryKey = problem.category.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const hidesFunctionContract = categoryKey === "system design";
  const timeComplexity = splitComplexity(problem.timeComplexity, "O(n + m)", "Complexity explanation has not been added yet.");
  const spaceComplexity = splitComplexity(problem.spaceComplexity, "O(1) auxiliary", "Complexity explanation has not been added yet.");
  useEffect(() => setNotes(window.localStorage.getItem(notesKey) || ""), [notesKey]);
  useEffect(() => {
    const htmlOverflow = document.documentElement.style.overflow;
    const bodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = htmlOverflow;
      document.body.style.overflow = bodyOverflow;
    };
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("practice-page-dark", dark);
    return () => document.documentElement.classList.remove("practice-page-dark");
  }, [dark]);
  const reset = () => { setCode(practiceTemplates[language]); setCompleted(false); setOutputMessage(""); setConsoleTab("Examples"); };
  const recordSolved = () => { if (!problemId || solved) return; void fetch("/api/problem/process", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ problemId, status: "SOLVED" }) }).then((response) => { if (response.ok) setSolved(true); }); };
  const toggleFavorite = async () => { if (!problemId || savingFavorite) return; setSavingFavorite(true); try { const response = await fetch("/api/problem/favorite", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ problemId }) }); const result = await response.json().catch(() => ({})); if (response.ok && typeof result.isFavorited === "boolean") setFavorited(result.isFavorited); } finally { setSavingFavorite(false); } };
  const run = async () => { if (!code.trim() || running) return; setCompleted(false); setRunning(true); setConsoleTab("Output"); setOutputMessage(`Loading the ${language} practice runtime…`); try { const input = consoleTab === "Custom Test" ? customInput : selected.input; const result = language === "Python 3" ? await runPython(code, input, practiceFunctionName, problem.functionDescription.parameters.map((parameter) => parameter.name)) : await runJudge0(language, code, input, practiceFunctionName, problem.functionDescription.parameters); setOutputMessage(result.output); setCompleted(result.success); if (result.success) recordSolved(); } catch (error) { setOutputMessage(error instanceof Error ? error.message : "Unable to run code."); } finally { setRunning(false); } };
  const changeLanguage = (next: PracticeLanguage) => { setLanguage(next); setCode(practiceTemplates[next]); setCompleted(false); setOutputMessage(""); setConsoleTab("Examples"); }; const copySolution = async () => { await navigator.clipboard?.writeText(solution); setCopied(true); window.setTimeout(() => setCopied(false), 1500); }; const saveNotes = () => { window.localStorage.setItem(notesKey, notes); setSaved(true); window.setTimeout(() => setSaved(false), 1600); };
  const startResize = (event: React.PointerEvent<HTMLDivElement>) => {
    const bounds = workspaceRef.current?.getBoundingClientRect();
    if (!bounds) return;
    event.preventDefault();
    const move = (moveEvent: PointerEvent) => setLeftWidth(Math.max(32, Math.min(68, ((moveEvent.clientX - bounds.left) / bounds.width) * 100)));
    const stop = () => { document.removeEventListener("pointermove", move); document.removeEventListener("pointerup", stop); };
    document.addEventListener("pointermove", move); document.addEventListener("pointerup", stop);
  };
  const startConsoleResize = (event: React.PointerEvent<HTMLDivElement>) => {
    const bounds = rightPanelRef.current?.getBoundingClientRect();
    if (!bounds) return;
    event.preventDefault();
    const startY = event.clientY;
    const startHeight = consoleHeight;
    const move = (moveEvent: PointerEvent) => setConsoleHeight(Math.max(150, Math.min(bounds.height - 220, startHeight + startY - moveEvent.clientY)));
    const stop = () => { document.removeEventListener("pointermove", move); document.removeEventListener("pointerup", stop); document.body.style.cursor = ""; document.body.style.userSelect = ""; };
    document.body.style.cursor = "row-resize"; document.body.style.userSelect = "none";
    document.addEventListener("pointermove", move); document.addEventListener("pointerup", stop);
  };
  const moveTabFocus = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    items: string[],
    current: string,
    update: (value: string) => void,
  ) => {
    const currentIndex = items.indexOf(current);
    let nextIndex = currentIndex;
    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % items.length;
    else if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + items.length) % items.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = items.length - 1;
    else return;
    event.preventDefault();
    update(items[nextIndex]);
    const buttons = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    buttons?.[nextIndex]?.focus();
  };
  const handleWorkspaceSeparatorKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    let nextWidth = leftWidth;
    if (event.key === "ArrowLeft") nextWidth -= 2;
    else if (event.key === "ArrowRight") nextWidth += 2;
    else if (event.key === "Home") nextWidth = 32;
    else if (event.key === "End") nextWidth = 68;
    else return;
    event.preventDefault();
    setLeftWidth(Math.max(32, Math.min(68, nextWidth)));
  };
  const handleConsoleSeparatorKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const maximum = Math.max(150, (rightPanelRef.current?.clientHeight || 720) - 220);
    let nextHeight = consoleHeight;
    if (event.key === "ArrowUp") nextHeight += 20;
    else if (event.key === "ArrowDown") nextHeight -= 20;
    else if (event.key === "Home") nextHeight = 150;
    else if (event.key === "End") nextHeight = maximum;
    else return;
    event.preventDefault();
    setConsoleHeight(Math.max(150, Math.min(maximum, nextHeight)));
  };
  const tabContent = () => {
    if (tab === "Problem") return <div className="space-y-6"><section><h2 className="text-base font-black text-slate-950">Problem Description</h2><div className="mt-2"><MarkdownRenderer content={problem.description} /></div></section><section><div className="flex flex-wrap items-center gap-2"><h2 className="mr-1 text-base font-black text-slate-950">Example</h2>{activeExamples.map((item, index) => <button type="button" key={`problem-example-${index}`} onClick={() => { setExample(index); setCompleted(false); }} className={`rounded-lg px-2.5 py-1.5 text-xs font-bold ${example === index ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>Example {index + 1}</button>)}</div><div className="mt-3 grid gap-3"><div><div className="mb-1 text-[11px] font-extrabold uppercase tracking-wide text-slate-400">Input</div><Sample dark={dark}>{selected.input || problem.example}</Sample></div><div><div className="mb-1 text-[11px] font-extrabold uppercase tracking-wide text-slate-400">Output</div><Sample dark={dark}>{selected.output}</Sample></div><div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3"><h3 className="text-sm font-bold text-blue-950">Explanation</h3><MarkdownRenderer content={selected.explanation || "Review how the input values transform into the expected output."} /></div></div></section><section><h2 className="text-base font-black text-slate-950">Function Description</h2><div className="mt-2 rounded-xl border border-slate-200 p-4"><div className="text-[11px] font-extrabold uppercase tracking-wide text-slate-400">Function Name</div><MarkdownRenderer content={problem.functionDescription.functionName} /></div></section>{visibleParameters.length > 0 && <section><h2 className="text-base font-black text-slate-950">Parameters</h2><div className="mt-2 grid gap-3">{visibleParameters.map((parameter, index) => <div key={`${parameter.name}-${index}`} className="grid gap-3 rounded-xl border border-slate-200 p-4 sm:grid-cols-[1fr_1fr_2fr]"><div><div className="text-[11px] font-extrabold uppercase tracking-wide text-slate-400">Name</div><MarkdownRenderer content={parameter.name} /></div><div><div className="text-[11px] font-extrabold uppercase tracking-wide text-slate-400">Type</div><MarkdownRenderer content={parameter.type} /></div><div><div className="text-[11px] font-extrabold uppercase tracking-wide text-slate-400">Description</div><MarkdownRenderer content={parameter.description} /></div></div>)}</div></section>}<section><h2 className="text-base font-black text-slate-950">Return Description</h2><div className="mt-2 rounded-xl border border-slate-200 p-4"><MarkdownRenderer content={problem.functionDescription.returnDescription || "Return the expected result."} /></div></section><section><h2 className="text-base font-black text-slate-950">Constraints</h2><div className="mt-2"><MarkdownRenderer content={(problem.constraints?.length ? problem.constraints : ["Follow the input limits described in the problem."]).map((constraint) => `- ${constraint}`).join("\n")} /></div></section><section><h2 className="text-base font-black text-slate-950">Follow-up Questions</h2><div className="mt-2 rounded-xl border border-violet-100 bg-violet-50/40 p-4"><MarkdownRenderer content={problem.aiFollowUpQuestions || "No follow-up questions have been added yet."} /></div></section></div>;
    if (tab === "Approach") return <div className="space-y-3">{[["How to Think", problem.approachHowToThink || "Identify the properties of the input that let you choose an efficient strategy."], ["Key Observations", problem.approachObservations || "Write down the observations that justify your chosen approach."], ["Step-by-step Approach", problem.approachSteps || problem.approach || "Work through the input step by step, then explain why the approach handles edge cases."]].map(([title, body]) => <div key={title} className="rounded-xl border border-slate-200 p-4"><h2 className="font-black text-slate-950">{title}</h2><MarkdownRenderer content={body} /></div>)}</div>;
    if (tab === "Solution") return canAccess ? <div className="flex h-full min-h-0 flex-col"><div className="mb-3 flex shrink-0 flex-wrap items-center justify-between gap-2"><div><h2 className="font-black text-slate-950">Reference Solution</h2><p className="mt-1 text-xs text-slate-500">Review after writing your own approach.</p></div><div className="flex items-center gap-2"><select value={solutionLanguage} onChange={(event) => setSolutionLanguage(event.target.value as ReferenceSolutionLanguage)} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-bold"><option>Python 3</option><option>Java</option><option>C++</option><option>JavaScript</option></select><button onClick={copySolution} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:text-blue-600"><Copy className="h-3.5 w-3.5"/>{copied ? "Copied" : "Copy Code"}</button></div></div><div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-slate-200"><Editor height="100%" language={editorLanguage(solutionLanguage)} value={solution} theme={dark ? "vs-dark" : "vs-light"} options={{ readOnly: true, minimap: { enabled: false }, fontFamily: "Cascadia Code, Consolas, monospace", fontSize: 14, lineHeight: 23, fontLigatures: true, lineNumbers: "on", scrollBeyondLastLine: false, padding: { top: 12, bottom: 12 }, automaticLayout: true }} /></div></div> : <div className="rounded-xl border border-blue-200 bg-blue-50 p-5"><h2 className="font-black text-blue-900">Reference solution is a Pro resource</h2><p className="mt-1 text-sm text-blue-800">Practice with the prompt, approach, and AI guidance for free.</p><Link href="/pricing" className="mt-3 inline-flex rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white">Explore plans</Link></div>;
    if (tab === "Complexity") return <div className="space-y-3"><div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4"><div className="text-xs font-extrabold uppercase tracking-wide text-blue-600">Time Complexity</div><MarkdownRenderer content={`${timeComplexity.value}\n\n${timeComplexity.explanation}`} /></div><div className="rounded-xl border border-violet-100 bg-violet-50/50 p-4"><div className="text-xs font-extrabold uppercase tracking-wide text-violet-600">Space Complexity</div><MarkdownRenderer content={`${spaceComplexity.value}\n\n${spaceComplexity.explanation}`} /></div></div>;
    return <div className="space-y-3"><div className="rounded-xl border border-violet-200 bg-violet-50/60 p-4"><div className="flex items-center gap-2 font-black text-violet-900"><BrainCircuit className="h-4 w-4"/>What interviewer is testing</div><MarkdownRenderer content={problem.aiInterviewFocus || "Recognizing sorted inputs, choosing a linear strategy, and communicating correctness."} /></div>{[["Key Concepts", problem.aiKeyConcepts || "Core concepts, invariants, and edge-case handling."], ["Common Mistakes", problem.aiCommonMistakes || "Common implementation mistakes and missing edge cases."], ["Better Answer Strategy", problem.aiBetterStrategy || "State your approach, validate it with an example, then explain complexity."]].map(([title, body]) => <div key={title} className="rounded-xl border border-slate-200 p-4"><h2 className="font-black text-slate-950">{title}</h2><MarkdownRenderer content={body} /></div>)}</div>;
  };
  return <main className={`practice-workspace fixed inset-0 z-[60] overflow-hidden transition-colors ${dark ? "practice-workspace-dark bg-slate-950" : "bg-slate-50"} ${full ? "z-[70]" : ""} ${hidesFunctionContract ? "practice-non-coding-problem" : ""}`}><div className="practice-workspace-shell mx-auto flex h-full w-full max-w-none flex-col px-2 py-2 sm:px-3 lg:px-4"><div className="practice-topbar mb-2 flex shrink-0 items-center justify-between"><Link href="/problem" className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-500 hover:bg-white hover:text-blue-600"><ChevronLeft className="h-4 w-4"/>Back to Questions</Link><span className="hidden text-xs font-semibold text-slate-400 sm:block">Practice · Learn · Get Better at Interviews</span></div><div ref={workspaceRef} className="practice-workspace-panels flex min-h-0 flex-1 items-stretch gap-0">
    <section style={{ width: `${leftWidth}%` }} className="practice-workspace-panel practice-surface practice-content flex min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="shrink-0 border-b border-slate-100 p-4 sm:p-5"><div className="flex flex-wrap gap-2"><span className="rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-extrabold text-white">{problem.company}</span><span className={`rounded-lg border px-2.5 py-1 text-xs font-extrabold ${difficultyStyle(problem.difficulty)}`}>{problem.difficulty}</span><span className="rounded-lg bg-violet-50 px-2.5 py-1 text-xs font-bold text-violet-700">Coding Interview</span>{problem.topics.slice(0, 4).map((topic) => <span key={topic} className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{topic}</span>)}</div><h1 className="mt-3 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">{problem.title}</h1></div><div role="tablist" aria-label="Problem content" className="flex shrink-0 overflow-x-auto border-b border-slate-200 px-3">{primaryTabs.map((item) => <button id={`problem-tab-${item.toLowerCase().replace(/\s+/g, "-")}`} role="tab" aria-selected={tab === item} aria-controls="problem-tab-panel" tabIndex={tab === item ? 0 : -1} key={item} onClick={() => setTab(item)} onKeyDown={(event) => moveTabFocus(event, primaryTabs, tab, setTab)} className={`shrink-0 border-b-2 px-3 py-3 text-xs font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 ${tab === item ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-900"}`}>{item}</button>)}</div><div id="problem-tab-panel" role="tabpanel" aria-labelledby={`problem-tab-${tab.toLowerCase().replace(/\s+/g, "-")}`} tabIndex={0} className="min-h-0 flex-1 overflow-y-auto p-5 text-sm leading-7 text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 sm:p-6">{tabContent()}</div></section>
    <div onPointerDown={startResize} onKeyDown={handleWorkspaceSeparatorKeyDown} role="separator" tabIndex={0} aria-orientation="vertical" aria-label="Resize workspace panels" aria-valuemin={32} aria-valuemax={68} aria-valuenow={Math.round(leftWidth)} className="practice-workspace-divider group mx-1 flex w-3 shrink-0 cursor-col-resize items-center justify-center touch-none rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
      <div className="flex h-14 w-1 items-center justify-center rounded-full bg-slate-200 transition group-hover:w-1.5 group-hover:bg-blue-400"><GripVertical className="h-4 w-4 -mx-1.5 text-slate-400 group-hover:text-blue-600"/></div>
    </div>
    <section ref={rightPanelRef} style={{ width: `calc(${100 - leftWidth}% - 20px)` }} className="practice-workspace-panel practice-editor-panel practice-surface practice-content flex min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="practice-muted-surface flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3"><div className="flex items-center gap-2"><TerminalSquare className="h-[18px] w-[18px] text-blue-600"/><span className="text-sm font-black text-slate-900">Coding Practice Area</span><select aria-label="Programming language" value={language} onChange={(event) => changeLanguage(event.target.value as keyof typeof practiceTemplates)} className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 outline-none"><option>Python 3</option><option>Java</option><option>C++</option><option>JavaScript</option></select></div><div className="flex flex-wrap items-center gap-1"><button onClick={() => setDark(!dark)} className="rounded-lg p-2.5 text-slate-600 hover:bg-white hover:text-blue-600" title="Switch workspace theme" aria-label="Switch workspace theme">{dark ? <Sun className="h-[18px] w-[18px]"/> : <Moon className="h-[18px] w-[18px]"/>}</button><button onClick={() => setFull(!full)} className="rounded-lg p-2.5 text-slate-600 hover:bg-white hover:text-blue-600" title="Fullscreen" aria-label={full ? "Exit fullscreen" : "Enter fullscreen"}>{full ? <Minimize2 className="h-[18px] w-[18px]"/> : <Expand className="h-[18px] w-[18px]"/>}</button><button onClick={toggleFavorite} disabled={savingFavorite || !problemId} aria-pressed={favorited} className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${favorited ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-white hover:text-blue-600"}`}><Bookmark className={`h-4 w-4 ${favorited ? "fill-current" : ""}`}/>{favorited ? "Saved" : "Save"}</button>{solved && <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-700"><Check className="h-4 w-4"/>Completed</span>}<button onClick={reset} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-white"><RotateCcw className="h-4 w-4"/>Reset Code</button><button onClick={run} disabled={running} className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-extrabold text-blue-700 hover:bg-blue-50 disabled:cursor-wait disabled:opacity-60"><Play className="h-4 w-4"/>{running ? "Running…" : "Run Code"}</button><button onClick={() => setTab("Solution")} className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-white hover:text-blue-600">View Solution</button><button onClick={() => setHint(Math.min(hint + 1, 3))} className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-extrabold text-white hover:bg-violet-700">AI Hint</button></div></div><div className="min-h-0 flex-1"><Editor height="100%" language={editorLanguage(language)} value={code} onChange={(value) => { setCode(value || ""); setCompleted(false); }} theme={dark ? "vs-dark" : "light"} options={{ minimap: { enabled: false }, fontFamily: "Cascadia Code, Consolas, monospace", fontSize: 15, lineHeight: 24, fontLigatures: true, lineNumbers: "on", automaticLayout: true, padding: { top: 18, bottom: 18 }, scrollBeyondLastLine: false, tabSize: 4, wordWrap: "on" }} /></div>
      {hint > 0 && <div className="border-t border-violet-100 bg-violet-50/50 px-4 py-3 text-xs text-slate-700"><span className="font-extrabold text-violet-700">AI Hint {hint}: </span>{hint === 1 ? "Think about how timestamps are merged." : hint === 2 ? "Consider using two pointers." : "Key direction: define what must be true after every pointer movement."}</div>}
      <div onPointerDown={startConsoleResize} onKeyDown={handleConsoleSeparatorKeyDown} role="separator" tabIndex={0} aria-orientation="horizontal" aria-label="Resize code editor and practice console" aria-valuemin={150} aria-valuemax={800} aria-valuenow={Math.round(consoleHeight)} className="group relative z-10 flex h-3 shrink-0 cursor-row-resize touch-none items-center justify-center border-y border-slate-200 bg-slate-50 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500">
        <div className="h-1 w-14 rounded-full bg-slate-300 transition group-hover:bg-blue-500" />
      </div>
      <div style={{ height: consoleHeight }} className="shrink-0 overflow-y-auto bg-white">
        <div className="flex items-center justify-between overflow-x-auto border-b border-slate-100 px-4"><div role="tablist" aria-label="Practice console" className="flex gap-1">{consoleTabs.map((item) => <button id={`console-tab-${item.toLowerCase().replace(/\s+/g, "-")}`} role="tab" aria-selected={consoleTab === item} aria-controls="console-tab-panel" tabIndex={consoleTab === item ? 0 : -1} key={item} onClick={() => setConsoleTab(item)} onKeyDown={(event) => moveTabFocus(event, consoleTabs, consoleTab, setConsoleTab)} className={`shrink-0 border-b-2 px-3 py-3 text-xs font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 ${consoleTab === item ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500"}`}>{item}</button>)}</div><span className="ml-4 shrink-0 text-[11px] font-medium text-slate-400">Practice Console</span></div>
        <div id="console-tab-panel" role="tabpanel" aria-labelledby={`console-tab-${consoleTab.toLowerCase().replace(/\s+/g, "-")}`} tabIndex={0} className="p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500">{consoleTab === "Output" ? <div><div className="mb-2 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wide text-slate-400"><TerminalSquare className="h-4 w-4 text-blue-600"/>Code Output</div><pre className="min-h-32 max-h-64 overflow-auto whitespace-pre-wrap rounded-xl border border-slate-200 bg-white p-4 font-mono text-xs leading-6 text-slate-900">{outputMessage || "Run your code to display output here."}</pre></div> : consoleTab === "Run History" ? <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Your practice runs will appear here after a code runner is connected.</div> : <><div className="mb-3 flex flex-wrap gap-2">{consoleTab === "Examples" && activeExamples.map((item, index) => <button onClick={() => { setExample(index); setCompleted(false); }} key={`example-${index}`} className={`rounded-lg px-2.5 py-1.5 text-xs font-bold ${example === index ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-600"}`}>Example {index + 1}</button>)}</div>{consoleTab === "Custom Test" && <textarea value={customInput} onChange={(event) => setCustomInput(event.target.value)} placeholder="Paste a custom input to reason through..." className="mb-3 min-h-20 w-full rounded-xl border border-slate-200 p-3 font-mono text-xs outline-none focus:border-blue-400"/>}<div className="grid gap-3 sm:grid-cols-2"><div><div className="mb-1 text-[11px] font-extrabold uppercase tracking-wide text-slate-400">Input</div><Sample dark={dark}>{consoleTab === "Custom Test" ? customInput || "Enter a custom input to think through your approach." : selected.input}</Sample></div><div><div className="mb-1 text-[11px] font-extrabold uppercase tracking-wide text-slate-400">Expected Output</div><Sample dark={dark}>{consoleTab === "Custom Test" ? "Compare your reasoning with expected behavior." : selected.output}</Sample></div></div><div className="mt-3"><button onClick={run} className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-extrabold text-blue-700 hover:bg-blue-100">Run Practice</button></div></>}</div>
      </div>
      <div className="shrink-0 border-t border-slate-200 bg-slate-50 p-3"><div className="flex items-center justify-between"><div className="flex items-center gap-2 text-sm font-black text-slate-900"><Save className="h-4 w-4 text-blue-600"/>Practice Notes</div><button onClick={saveNotes} className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-blue-700 shadow-sm ring-1 ring-slate-200">{saved ? "Notes saved" : "Save Notes"}</button></div><textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Capture your approach, edge cases, and interview takeaway..." className="mt-2 min-h-16 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-blue-400"/></div>
    </section></div></div></main>;
}

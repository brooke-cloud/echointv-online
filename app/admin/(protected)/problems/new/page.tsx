"use client";

import { useMemo, useState } from "react";
import Editor from "@monaco-editor/react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, ChevronLeft, FileCode2, Plus, RotateCcw, Sparkles, Trash2, X } from "lucide-react";
import { createProblem } from "../actions";
import { buildProblemImportFeedback, MAX_PROBLEM_IMPORT_CHARACTERS, parseProblemImportTextWithDiagnostics } from "@/lib/problem-content-import";
import { buildProblemImportPreview, summarizeImportCandidate, type ImportCandidateKey, type ProblemImportCandidate, type ProblemImportPreview } from "@/lib/problem-import-preview";

type Example = { input: string; output: string; explanation: string };
type Parameter = { name: string; type: string; description: string };
type Draft = {
  title: string; company: string; role: string; difficulty: string; stage: string; category: string; topics: string;
  description: string; isFree: boolean; functionName: string; parameters: Parameter[]; returnDescription: string;
  constraintsText: string; approachHowToThink: string; approachObservations: string; approachSteps: string;
  timeComplexity: string; spaceComplexity: string; aiInterviewFocus: string; aiKeyConcepts: string;
  aiCommonMistakes: string; aiFollowUpQuestions: string; aiBetterStrategy: string; solutionPython: string;
  solutionJava: string; solutionCpp: string; solutionJavascript: string; solutionSql: string; examples: Example[];
  solutionLanguage: "Python" | "Java" | "C++" | "JavaScript" | "SQL";
};
const emptyDraft: Draft = { title: "", company: "", role: "", difficulty: "", stage: "", category: "", topics: "", description: "", isFree: false, functionName: "", parameters: [], returnDescription: "", constraintsText: "", approachHowToThink: "", approachObservations: "", approachSteps: "", timeComplexity: "", spaceComplexity: "", aiInterviewFocus: "", aiKeyConcepts: "", aiCommonMistakes: "", aiFollowUpQuestions: "", aiBetterStrategy: "", solutionPython: "", solutionJava: "", solutionCpp: "", solutionJavascript: "", solutionSql: "", examples: [{ input: "", output: "", explanation: "" }], solutionLanguage: "Python" };
const languageMap = { Python: "python", Java: "java", "C++": "cpp", JavaScript: "javascript", SQL: "sql" } as const;
const solutionFieldMap = { Python: "solutionPython", Java: "solutionJava", "C++": "solutionCpp", JavaScript: "solutionJavascript", SQL: "solutionSql" } as const;

function applyImportCandidate(draft: Draft, candidate: ProblemImportCandidate): Draft {
  if (candidate.key === "examples") {
    if (!Array.isArray(candidate.value)) return draft;
    const examples = candidate.value.filter((item): item is Example => Boolean(item && typeof item === "object" && typeof (item as Example).input === "string" && typeof (item as Example).output === "string" && typeof (item as Example).explanation === "string"));
    return examples.length ? { ...draft, examples } : draft;
  }
  if (candidate.key === "parameters") {
    if (!Array.isArray(candidate.value)) return draft;
    const parameters = candidate.value.filter((item): item is Parameter => Boolean(item && typeof item === "object" && typeof (item as Parameter).name === "string" && typeof (item as Parameter).type === "string" && typeof (item as Parameter).description === "string"));
    return { ...draft, parameters };
  }
  if (typeof candidate.value !== "string") return draft;
  switch (candidate.key) {
    case "title": return { ...draft, title: candidate.value };
    case "company": return { ...draft, company: candidate.value };
    case "role": return { ...draft, role: candidate.value };
    case "difficulty": return { ...draft, difficulty: candidate.value };
    case "stage": return { ...draft, stage: candidate.value };
    case "category": return { ...draft, category: candidate.value };
    case "topics": return { ...draft, topics: candidate.value };
    case "description": return { ...draft, description: candidate.value };
    case "functionName": return { ...draft, functionName: candidate.value };
    case "returnDescription": return { ...draft, returnDescription: candidate.value };
    case "constraintsText": return { ...draft, constraintsText: candidate.value };
    case "approachHowToThink": return { ...draft, approachHowToThink: candidate.value };
    case "approachObservations": return { ...draft, approachObservations: candidate.value };
    case "approachSteps": return { ...draft, approachSteps: candidate.value };
    case "solutionPython": return { ...draft, solutionPython: candidate.value };
    case "solutionJava": return { ...draft, solutionJava: candidate.value };
    case "solutionCpp": return { ...draft, solutionCpp: candidate.value };
    case "solutionJavascript": return { ...draft, solutionJavascript: candidate.value };
    case "solutionSql": return { ...draft, solutionSql: candidate.value };
    case "timeComplexity": return { ...draft, timeComplexity: candidate.value };
    case "spaceComplexity": return { ...draft, spaceComplexity: candidate.value };
    case "aiInterviewFocus": return { ...draft, aiInterviewFocus: candidate.value };
    case "aiKeyConcepts": return { ...draft, aiKeyConcepts: candidate.value };
    case "aiCommonMistakes": return { ...draft, aiCommonMistakes: candidate.value };
    case "aiFollowUpQuestions": return { ...draft, aiFollowUpQuestions: candidate.value };
    case "aiBetterStrategy": return { ...draft, aiBetterStrategy: candidate.value };
    default: return draft;
  }
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) { return <label className="block"><span className="text-sm font-bold text-slate-800">{label}</span>{hint && <span className="ml-2 text-xs text-slate-400">{hint}</span>}{children}</label>; }
const control = "mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

export default function NewProblemPage() {
  const [draft, setDraft] = useState<Draft>(emptyDraft); const [submitting, setSubmitting] = useState(false); const [error, setError] = useState(""); const [importText, setImportText] = useState(""); const [importMessage, setImportMessage] = useState(""); const [importTone, setImportTone] = useState<"idle" | "success" | "warning" | "error">("idle");
  const [pendingImport, setPendingImport] = useState<ProblemImportPreview | null>(null);
  const [selectedImportKeys, setSelectedImportKeys] = useState<Set<ImportCandidateKey>>(new Set());
  const [undoDraft, setUndoDraft] = useState<Draft | null>(null);
  const update = (field: string, value: string) => setDraft((current) => ({ ...current, [field]: value }));
  const updateExample = (index: number, field: keyof Example, value: string) => setDraft((current) => ({ ...current, examples: current.examples.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item) }));
  const updateParameter = (index: number, field: keyof Parameter, value: string) => setDraft((current) => ({ ...current, parameters: current.parameters.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item) }));
  const importProblemContent = () => {
    if (!importText.trim()) { setImportMessage("Paste problem content before importing."); setImportTone("error"); return; }
    if (importText.length > MAX_PROBLEM_IMPORT_CHARACTERS) { setImportMessage(`Content is too large to analyze safely. The limit is ${MAX_PROBLEM_IMPORT_CHARACTERS.toLocaleString()} characters.`); setImportTone("error"); setPendingImport(null); return; }
    const { payload: parsed, diagnostics } = parseProblemImportTextWithDiagnostics(importText);
    const preview = buildProblemImportPreview(importText, parsed);
    const warnings = [...diagnostics.warnings, ...preview.warnings];
    const nextPreview = { ...preview, warnings: [...new Set(warnings)] };
    setPendingImport(nextPreview);
    setSelectedImportKeys(new Set(nextPreview.candidates.filter((candidate) => candidate.confidence === "high" && !candidate.warning).map((candidate) => candidate.key)));
    const feedback = buildProblemImportFeedback(diagnostics);
    setImportTone(nextPreview.candidates.length ? (nextPreview.warnings.length ? "warning" : "success") : feedback.tone);
    setImportMessage(nextPreview.candidates.length ? `Analysis complete. ${nextPreview.candidates.length} fields are ready for review; the form has not been changed.` : feedback.message);
  };
  const applyPendingImport = () => {
    if (!pendingImport) return;
    const selected = pendingImport.candidates.filter((candidate) => selectedImportKeys.has(candidate.key));
    if (!selected.length) { setImportTone("error"); setImportMessage("Select at least one field to apply."); return; }
    setUndoDraft(draft);
    setDraft((current) => {
      let next = { ...current };
      for (const candidate of selected) next = applyImportCandidate(next, candidate);
      const preferredLanguage = selected.find((candidate) => candidate.key === "solutionPython") ? "Python"
        : selected.find((candidate) => candidate.key === "solutionJava") ? "Java"
        : selected.find((candidate) => candidate.key === "solutionCpp") ? "C++"
        : selected.find((candidate) => candidate.key === "solutionJavascript") ? "JavaScript"
        : selected.find((candidate) => candidate.key === "solutionSql") ? "SQL" : current.solutionLanguage;
      next.solutionLanguage = preferredLanguage;
      return next;
    });
    setPendingImport(null);
    setImportTone("success");
    setImportMessage(`${selected.length} reviewed fields were applied. You can undo this import.`);
  };
  const undoImport = () => {
    if (!undoDraft) return;
    setDraft(undoDraft);
    setUndoDraft(null);
    setImportTone("success");
    setImportMessage("The last import was undone.");
  };
  const activeSolution = solutionFieldMap[draft.solutionLanguage] || "solutionPython";
  const legacyExample = useMemo(() => draft.examples.filter((item) => item.input || item.output || item.explanation).map((item, index) => `Example ${index + 1}\nInput:\n${item.input}\n\nOutput:\n${item.output}\n\nExplanation:\n${item.explanation}`).join("\n\n"), [draft.examples]);
  const submit = async (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); setError(""); setSubmitting(true); try { const formData = new FormData(event.currentTarget); await createProblem(formData); } catch (cause: unknown) { if (cause instanceof Error && cause.message.includes("NEXT_REDIRECT")) return; setError(cause instanceof Error ? cause.message : "Unable to create problem."); } finally { setSubmitting(false); } };
  return <main className="min-h-screen bg-slate-50 py-8"><div className="mx-auto max-w-6xl px-4 sm:px-6"><Link href="/admin/problems" className="inline-flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-blue-600"><ChevronLeft className="h-4 w-4"/>Back to Problems</Link><div className="mt-5"><h1 className="text-3xl font-black tracking-tight text-slate-950">Add Interview Problem</h1><p className="mt-1 text-sm text-slate-500">Create the exact learning experience users see in the Practice Workspace.</p></div>
    <section className="mt-7 rounded-2xl border border-blue-200 bg-blue-50/60 p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-blue-600"/><h2 className="text-lg font-black text-slate-950">One-click Content Import</h2></div><p className="mt-1 text-sm text-slate-600">Paste JSON, Markdown, or labelled text. Content is analyzed before any form value changes.</p></div>
        <div className="flex flex-wrap gap-2"><button type="button" onClick={importProblemContent} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700">Analyze content</button>{undoDraft && <button type="button" onClick={undoImport} className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-bold text-blue-700 hover:bg-blue-50"><RotateCcw className="h-4 w-4"/>Undo import</button>}</div>
      </div>
      <textarea value={importText} onChange={(event) => { setImportText(event.target.value); setImportMessage(""); setImportTone("idle"); setPendingImport(null); }} rows={10} className="mt-4 w-full rounded-xl border border-blue-200 bg-white p-4 font-mono text-sm leading-6 text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" placeholder={"Title: K Smallest Pairs\nCompany: Google\nDifficulty: Medium\nProblem Description:\n...\n\nExample:\nInput: ...\nOutput: ..."}/>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3"><p role={importTone === "error" ? "alert" : "status"} className={`text-sm font-semibold ${importTone === "success" ? "text-emerald-700" : importTone === "warning" ? "text-amber-700" : importTone === "error" ? "text-rose-700" : "text-slate-600"}`}>{importMessage || "Analyze first, then choose which recognized fields to apply."}</p>{importText && <button type="button" onClick={() => { setImportText(""); setImportMessage(""); setImportTone("idle"); setPendingImport(null); }} className="text-sm font-bold text-slate-500 hover:text-slate-900">Clear pasted content</button>}</div>
      {pendingImport && <div className="mt-4 overflow-hidden rounded-xl border border-blue-200 bg-white" aria-label="Import preview">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3"><div><h3 className="text-sm font-black text-slate-950">Review before applying</h3><p className="mt-0.5 text-xs text-slate-500">High-confidence fields are selected. Inferred fields require manual confirmation.</p><div className="mt-2 flex flex-wrap gap-2 text-[11px] font-bold"><span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-700">{pendingImport.candidates.filter((candidate) => candidate.confidence === "high").length} safe</span><span className="rounded-full bg-amber-50 px-2 py-1 text-amber-700">{pendingImport.issues.filter((issue) => issue.severity === "warning").length} warnings</span><span className="rounded-full bg-rose-50 px-2 py-1 text-rose-700">{pendingImport.issues.filter((issue) => issue.severity === "error").length} errors</span></div></div><button type="button" onClick={() => setPendingImport(null)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close import preview"><X className="h-4 w-4"/></button></div>
        {pendingImport.warnings.length > 0 && <div className="border-b border-amber-200 bg-amber-50 px-4 py-3"><p className="text-xs font-black uppercase tracking-wide text-amber-800">Needs attention</p><ul className="mt-1.5 space-y-1 text-sm text-amber-900">{pendingImport.warnings.map((warning) => <li key={warning}>• {warning}</li>)}</ul></div>}
        <div className="max-h-80 divide-y divide-slate-100 overflow-y-auto">{pendingImport.candidates.map((candidate) => { const selected = selectedImportKeys.has(candidate.key); return <label key={candidate.key} className="flex cursor-pointer items-start gap-3 px-4 py-3 hover:bg-slate-50"><input type="checkbox" checked={selected} onChange={(event) => setSelectedImportKeys((current) => { const next = new Set(current); if (event.target.checked) next.add(candidate.key); else next.delete(candidate.key); return next; })} className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"/><span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-2"><span className="text-sm font-bold text-slate-900">{candidate.label}</span><span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${candidate.confidence === "high" ? "bg-emerald-50 text-emerald-700" : candidate.confidence === "medium" ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"}`}>{candidate.confidence}</span></span><span className="mt-0.5 block truncate text-xs text-slate-600">{summarizeImportCandidate(candidate.value)}</span><span className="mt-1 block text-[11px] text-slate-400">{candidate.source}{candidate.sourceLine ? ` · line ${candidate.sourceLine}` : ""}</span>{candidate.warning && <span className="mt-1 block text-xs font-semibold text-rose-700">{candidate.warning}</span>}</span></label>; })}</div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3"><p className="text-xs font-semibold text-slate-500">{selectedImportKeys.size} of {pendingImport.candidates.length} fields selected</p><button type="button" onClick={applyPendingImport} disabled={!selectedImportKeys.size} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-black text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"><CheckCircle2 className="h-4 w-4"/>Apply selected fields</button></div>
      </div>}
    </section>
    <form onSubmit={submit} className="mt-5 space-y-5">{error && <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700"><AlertCircle className="h-4 w-4"/>{error}</div>}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><h2 className="text-lg font-black text-slate-950">1. Basic Information</h2><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><Field label="Title "><input required name="title" value={draft.title} onChange={(e) => update("title", e.target.value)} className={control}/></Field><Field label="Company *"><input required name="company" value={draft.company} onChange={(e) => update("company", e.target.value)} className={control}/></Field><Field label="Role"><input name="role" value={draft.role} onChange={(e) => update("role", e.target.value)} className={control}/></Field><Field label="Difficulty"><select name="difficulty" value={draft.difficulty} onChange={(e) => update("difficulty", e.target.value)} className={control}><option value="">Select difficulty</option><option>Easy</option><option>Medium</option><option>Hard</option></select></Field><Field label="Interview Type"><select name="stage" value={draft.stage} onChange={(e) => update("stage", e.target.value)} className={control}><option value="">Select interview type</option><option value="VO">Coding Interview</option><option value="OA">Online Assessment</option></select></Field><Field label="Access"><select name="isFree" value={draft.isFree ? "true" : "false"} onChange={(event) => setDraft((current) => ({ ...current, isFree: event.target.value === "true" }))} className={control}><option value="false">Paid (Pro)</option><option value="true">Free</option></select></Field><Field label="Category *"><input required name="category" value={draft.category} onChange={(e) => update("category", e.target.value)} className={control}/></Field></div><Field label="Topics" hint="Separate with commas"><input name="topics" value={draft.topics} onChange={(e) => update("topics", e.target.value)} placeholder="Algorithms, Hash Map, Two Pointers" className={control}/></Field></section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><h2 className="text-lg font-black text-slate-950">2. Problem Description</h2><p className="mt-1 text-xs text-slate-500">Markdown is supported.</p><textarea required name="description" value={draft.description} onChange={(e) => update("description", e.target.value)} rows={8} className={`${control} font-mono`} placeholder="Write the interview problem as candidates should read it."/></section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-center justify-between"><div><h2 className="text-lg font-black text-slate-950">3. Examples</h2><p className="mt-1 text-xs text-slate-500">Each example has its own input, output, and explanation.</p></div><button type="button" onClick={() => setDraft((current) => ({ ...current, examples: [...current.examples, { input: "", output: "", explanation: "" }] }))} className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700"><Plus className="h-3.5 w-3.5"/>Add Example</button></div><input type="hidden" name="examplesJson" value={JSON.stringify(draft.examples)}/><textarea className="hidden" name="example" value={legacyExample} readOnly/>{draft.examples.map((item, index) => <div key={index} className="mt-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4"><div className="flex items-center justify-between"><h3 className="text-sm font-bold text-slate-900">Example {index + 1}</h3>{draft.examples.length > 1 && <button type="button" onClick={() => setDraft((current) => ({ ...current, examples: current.examples.filter((_, itemIndex) => itemIndex !== index) }))} className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-4 w-4"/></button>}</div><div className="mt-3 grid gap-3 sm:grid-cols-2"><Field label="Input"><textarea value={item.input} onChange={(e) => updateExample(index, "input", e.target.value)} rows={4} className={`${control} font-mono`}/></Field><Field label="Output"><textarea value={item.output} onChange={(e) => updateExample(index, "output", e.target.value)} rows={4} className={`${control} font-mono`}/></Field></div><Field label="Explanation"><textarea value={item.explanation} onChange={(e) => updateExample(index, "explanation", e.target.value)} rows={3} className={control}/></Field></div>)}</section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-sm font-black text-blue-700">4</span><div><h2 className="text-lg font-black text-slate-950">Function Description</h2><p className="mt-1 text-xs text-slate-500">Structured function signature, parameters, and return contract.</p></div></div>
        <div className="mt-6"><Field label="Function Name"><input name="functionName" value={draft.functionName} onChange={(e) => update("functionName", e.target.value)} className={control}/></Field></div>
        <div className="mt-5 flex items-center justify-between"><h3 className="text-sm font-black text-slate-900">Parameters</h3><button type="button" onClick={() => setDraft((current) => ({ ...current, parameters: [...current.parameters, { name: "", type: "", description: "" }] }))} className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700"><Plus className="h-3.5 w-3.5"/>Add Parameter</button></div>
        <input type="hidden" name="functionParameters" value={draft.parameters.map((parameter) => [parameter.name, parameter.type, parameter.description].join(" | ")).join("\n")}/>
        <div className="mt-3 space-y-3">{draft.parameters.map((parameter, index) => <div key={index} className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3 sm:grid-cols-[1fr_1fr_2fr_auto]"><Field label="Name"><input value={parameter.name} onChange={(event) => updateParameter(index, "name", event.target.value)} className={control}/></Field><Field label="Type"><input value={parameter.type} onChange={(event) => updateParameter(index, "type", event.target.value)} className={control}/></Field><Field label="Description"><input value={parameter.description} onChange={(event) => updateParameter(index, "description", event.target.value)} className={control}/></Field><button type="button" onClick={() => setDraft((current) => ({ ...current, parameters: current.parameters.filter((_, itemIndex) => itemIndex !== index) }))} className="mt-7 rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600" aria-label={`Remove parameter ${index + 1}`}><Trash2 className="h-4 w-4"/></button></div>)}</div>
        <div className="mt-5"><Field label="Return Description"><textarea name="returnDescription" value={draft.returnDescription} onChange={(e) => update("returnDescription", e.target.value)} rows={3} className={control}/></Field></div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><h2 className="text-lg font-black text-slate-950">5. Constraints</h2><textarea name="constraintsText" value={draft.constraintsText} onChange={(e) => update("constraintsText", e.target.value)} rows={5} placeholder="One constraint per line" className={`${control} font-mono`}/></section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-black text-slate-950">6. Solution</h2><p className="mt-1 text-xs text-slate-500">Reference code is stored per language and displayed in the Solution tab.</p></div><div className="flex flex-wrap rounded-lg bg-slate-100 p-1">{(["Python", "Java", "C++", "JavaScript", "SQL"] as const).map((language) => <button type="button" key={language} onClick={() => update("solutionLanguage", language)} className={`rounded-md px-3 py-1.5 text-xs font-bold ${draft.solutionLanguage === language ? "bg-white text-blue-700 shadow-sm" : "text-slate-500"}`}>{language}</button>)}</div></div><input type="hidden" name="solutionLanguage" value={draft.solutionLanguage.toLowerCase()}/><textarea className="hidden" name="solution" value={draft.solutionPython || draft.solutionJava || draft.solutionCpp || draft.solutionJavascript || draft.solutionSql || ""} readOnly/>{(["Python", "Java", "C++", "JavaScript", "SQL"] as const).map((language) => { const field = solutionFieldMap[language]; return <input key={language} type="hidden" name={field} value={draft[field] || ""}/>; })}<div className="mt-4 overflow-hidden rounded-xl border border-slate-200"><Editor height="360px" language={languageMap[draft.solutionLanguage] || "python"} value={draft[activeSolution] || ""} onChange={(value) => update(activeSolution, value || "")} theme="vs-light" options={{ minimap: { enabled: false }, fontSize: 13, automaticLayout: true, tabSize: 4, lineNumbers: "on" }}/></div></section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><h2 className="text-lg font-black text-slate-950">7. Approach</h2><div className="mt-4 grid gap-4"><Field label="How to Think"><textarea name="approachHowToThink" value={draft.approachHowToThink} onChange={(e) => update("approachHowToThink", e.target.value)} rows={3} className={control}/></Field><Field label="Key Observations"><textarea name="approachObservations" value={draft.approachObservations} onChange={(e) => update("approachObservations", e.target.value)} rows={3} className={control}/></Field><Field label="Step-by-step Approach"><textarea name="approachSteps" value={draft.approachSteps} onChange={(e) => update("approachSteps", e.target.value)} rows={5} className={control}/></Field></div><textarea className="hidden" name="approach" value={draft.approachSteps} readOnly/></section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><h2 className="text-lg font-black text-slate-950">8. Complexity</h2><div className="mt-4 grid gap-4 sm:grid-cols-2"><Field label="Time Complexity" hint="Complexity first, explanation below"><textarea name="timeComplexity" value={draft.timeComplexity} onChange={(e) => update("timeComplexity", e.target.value)} rows={4} placeholder={"O(n + m)\n\nExplain why."} className={control}/></Field><Field label="Space Complexity" hint="Complexity first, explanation below"><textarea name="spaceComplexity" value={draft.spaceComplexity} onChange={(e) => update("spaceComplexity", e.target.value)} rows={4} placeholder={"O(1)\n\nExplain why."} className={control}/></Field></div></section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><h2 className="text-lg font-black text-slate-950">9. AI Analysis</h2><div className="mt-4 grid gap-4"><Field label="Interview Focus"><textarea name="aiInterviewFocus" value={draft.aiInterviewFocus} onChange={(e) => update("aiInterviewFocus", e.target.value)} rows={3} className={control}/></Field><Field label="Key Concepts"><textarea name="aiKeyConcepts" value={draft.aiKeyConcepts} onChange={(e) => update("aiKeyConcepts", e.target.value)} rows={3} className={control}/></Field><Field label="Common Mistakes"><textarea name="aiCommonMistakes" value={draft.aiCommonMistakes} onChange={(e) => update("aiCommonMistakes", e.target.value)} rows={3} className={control}/></Field><Field label="Follow-up Questions"><textarea name="aiFollowUpQuestions" value={draft.aiFollowUpQuestions} onChange={(e) => update("aiFollowUpQuestions", e.target.value)} rows={3} className={control}/></Field><Field label="Better Answer Strategy"><textarea name="aiBetterStrategy" value={draft.aiBetterStrategy} onChange={(e) => update("aiBetterStrategy", e.target.value)} rows={3} className={control}/></Field></div></section>
      <button disabled={submitting} type="submit" className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 text-sm font-black text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-50"><FileCode2 className="h-4 w-4"/>{submitting ? "Creating problem…" : "Create Problem"}</button>
    </form></div></main>;
}

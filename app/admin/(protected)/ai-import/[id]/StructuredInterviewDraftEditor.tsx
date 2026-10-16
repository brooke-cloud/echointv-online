"use client";

import Editor from "@monaco-editor/react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { ImportExample, ImportParameter, InterviewImportPayload } from "@/lib/interview-import-schema";
import { publishImportDraftAction, rejectImportDraftAction, saveImportDraftAction } from "../actions";

const control = "mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100";
const area = `${control} min-h-28 resize-y leading-6`;
const card = "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6";
const splitValues = (value: string) => value.split(/[,;\n]/).map((item) => item.trim()).filter(Boolean);
const splitLines = (value: string) => value.split(/\r?\n/).map((item) => item.replace(/^[-*•]\s*/, "").trim()).filter(Boolean);

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-sm font-bold text-slate-800">{label}</span>{hint && <span className="ml-2 text-xs text-slate-400">{hint}</span>}{children}</label>;
}

function Section({ number, title, description, children }: { number: number; title: string; description?: string; children: React.ReactNode }) {
  return <section className={card}><div className="flex items-start gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-xs font-black text-blue-700">{number}</span><div><h2 className="text-lg font-black text-slate-950">{title}</h2>{description && <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>}</div></div><div className="mt-5">{children}</div></section>;
}

type Props = {
  draftId: number;
  initial: InterviewImportPayload;
  rawContent: string;
  status: string;
  missingFields: string[];
  problemSlug?: string;
};

export default function StructuredInterviewDraftEditor({ draftId, initial, rawContent, status, missingFields, problemSlug }: Props) {
  const [question, setQuestion] = useState(initial);
  const [categoryText, setCategoryText] = useState(initial.category.join(", "));
  const [topicsText, setTopicsText] = useState(initial.topics.join(", "));
  const [constraintsText, setConstraintsText] = useState(initial.constraints.join("\n"));
  const [activeLanguage, setActiveLanguage] = useState<keyof InterviewImportPayload["solution"]>("python");
  const [savedMissingFields, setSavedMissingFields] = useState(missingFields);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const locked = status === "PUBLISHED";

  const updateBasic = (key: "title" | "company" | "role" | "difficulty" | "stage" | "problemDescription", value: string) => setQuestion((current) => ({ ...current, [key]: value }));
  const updateExample = (index: number, key: keyof ImportExample, value: string) => setQuestion((current) => ({ ...current, examples: current.examples.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item) }));
  const updateParameter = (index: number, key: keyof ImportParameter, value: string) => setQuestion((current) => ({ ...current, functionDescription: { ...current.functionDescription, parameters: current.functionDescription.parameters.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item) } }));
  const updateFunction = (key: "functionName" | "returnDescription", value: string) => setQuestion((current) => ({ ...current, functionDescription: { ...current.functionDescription, [key]: value } }));
  const updateApproach = (key: keyof InterviewImportPayload["approach"], value: string) => setQuestion((current) => ({ ...current, approach: { ...current.approach, [key]: value } }));
  const updateComplexity = (key: keyof InterviewImportPayload["complexity"], value: string) => setQuestion((current) => ({ ...current, complexity: { ...current.complexity, [key]: value } }));
  const updateAnalysis = (key: keyof InterviewImportPayload["aiAnalysis"], value: string) => setQuestion((current) => ({ ...current, aiAnalysis: { ...current.aiAnalysis, [key]: value } }));
  const updateSolution = (value: string) => setQuestion((current) => ({ ...current, solution: { ...current.solution, [activeLanguage]: value } }));

  const currentPayload = (): InterviewImportPayload => ({ ...question, category: splitValues(categoryText), topics: splitValues(topicsText), constraints: splitLines(constraintsText) });
  const save = () => startTransition(async () => {
    try {
      const payload = currentPayload();
      const result = await saveImportDraftAction(draftId, JSON.stringify(payload));
      setQuestion(payload);
      setSavedMissingFields(result.missingFields);
      setMessage(result.missingFields.length ? `Draft saved. Fields still missing: ${result.missingFields.join(", ")}` : "Draft saved successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save the draft.");
    }
  });
  const approve = () => startTransition(async () => {
    try {
      const payload = currentPayload();
      await saveImportDraftAction(draftId, JSON.stringify(payload));
      const result = await publishImportDraftAction(draftId);
      setMessage(`Published successfully: ${result.slug}`);
      window.location.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to approve this draft.");
    }
  });
  const reject = () => {
    if (!confirm("Reject this draft? The source and edits will be retained.")) return;
    startTransition(async () => {
      try {
        await rejectImportDraftAction(draftId);
        setMessage("Draft rejected. Its source and edited content were retained.");
        window.location.reload();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Unable to reject this draft.");
      }
    });
  };

  const languages = [{ key: "python", label: "Python", monaco: "python" }, { key: "java", label: "Java", monaco: "java" }, { key: "cpp", label: "C++", monaco: "cpp" }] as const;
  const activeMonacoLanguage = languages.find((item) => item.key === activeLanguage)?.monaco || "python";

  return <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,.55fr)]">
    <div className="space-y-5">
      <Section number={1} title="Basic Information" description="These values map directly to the Interview Question header and filters.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Title "><input value={question.title} onChange={(event) => updateBasic("title", event.target.value)} className={control} /></Field>
          <Field label="Company *"><input value={question.company} onChange={(event) => updateBasic("company", event.target.value)} className={control} /></Field>
          <Field label="Role"><input value={question.role} onChange={(event) => updateBasic("role", event.target.value)} className={control} /></Field>
          <Field label="Difficulty"><input value={question.difficulty} onChange={(event) => updateBasic("difficulty", event.target.value)} placeholder="Easy, Medium, or Hard" className={control} /></Field>
          <Field label="Stage"><input value={question.stage} onChange={(event) => updateBasic("stage", event.target.value)} placeholder="Coding Interview" className={control} /></Field>
          <Field label="Category" hint="Comma separated"><input value={categoryText} onChange={(event) => setCategoryText(event.target.value)} className={control} /></Field>
        </div>
        <div className="mt-4"><Field label="Topics" hint="Comma separated"><input value={topicsText} onChange={(event) => setTopicsText(event.target.value)} placeholder="Algorithms, Heap, Two Pointers" className={control} /></Field></div>
      </Section>

      <Section number={2} title="Problem Description" description="Markdown content shown in the Problem tab.">
        <textarea value={question.problemDescription} onChange={(event) => updateBasic("problemDescription", event.target.value)} rows={10} className={`${area} font-mono text-[13px]`} />
      </Section>

      <Section number={3} title="Examples" description="Each example has its own input, output, and explanation.">
        <div className="flex justify-end"><button type="button" onClick={() => setQuestion((current) => ({ ...current, examples: [...current.examples, { input: "", output: "", explanation: "" }] }))} className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100"><Plus className="h-3.5 w-3.5" />Add Example</button></div>
        <div className="space-y-4">{question.examples.length ? question.examples.map((example, index) => <div key={index} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4"><div className="flex items-center justify-between"><h3 className="text-sm font-black text-slate-900">Example {index + 1}</h3><button type="button" onClick={() => setQuestion((current) => ({ ...current, examples: current.examples.filter((_, itemIndex) => itemIndex !== index) }))} className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600" aria-label={`Remove example ${index + 1}`}><Trash2 className="h-4 w-4" /></button></div><div className="mt-3 grid gap-3 sm:grid-cols-2"><Field label="Input"><textarea value={example.input} onChange={(event) => updateExample(index, "input", event.target.value)} rows={4} className={`${control} font-mono text-xs`} /></Field><Field label="Output"><textarea value={example.output} onChange={(event) => updateExample(index, "output", event.target.value)} rows={4} className={`${control} font-mono text-xs`} /></Field></div><div className="mt-3"><Field label="Explanation"><textarea value={example.explanation} onChange={(event) => updateExample(index, "explanation", event.target.value)} rows={3} className={control} /></Field></div></div>) : <p className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500">No examples yet. Add one when the source provides enough information.</p>}</div>
      </Section>

      <Section number={4} title="Function Description" description="Structured function signature, parameters, and return contract.">
        <Field label="Function Name"><input value={question.functionDescription.functionName} onChange={(event) => updateFunction("functionName", event.target.value)} className={control} /></Field>
        <div className="mt-5 flex items-center justify-between"><h3 className="text-sm font-black text-slate-900">Parameters</h3><button type="button" onClick={() => setQuestion((current) => ({ ...current, functionDescription: { ...current.functionDescription, parameters: [...current.functionDescription.parameters, { name: "", type: "", description: "" }] } }))} className="inline-flex items-center gap-1 rounded-lg border border-blue-200 px-3 py-2 text-xs font-bold text-blue-700"><Plus className="h-3.5 w-3.5" />Add Parameter</button></div>
        <div className="mt-3 space-y-3">{question.functionDescription.parameters.map((parameter, index) => <div key={index} className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3 sm:grid-cols-[1fr_1fr_2fr_auto]"><Field label="Name"><input value={parameter.name} onChange={(event) => updateParameter(index, "name", event.target.value)} className={control} /></Field><Field label="Type"><input value={parameter.type} onChange={(event) => updateParameter(index, "type", event.target.value)} className={control} /></Field><Field label="Description"><input value={parameter.description} onChange={(event) => updateParameter(index, "description", event.target.value)} className={control} /></Field><button type="button" onClick={() => setQuestion((current) => ({ ...current, functionDescription: { ...current.functionDescription, parameters: current.functionDescription.parameters.filter((_, itemIndex) => itemIndex !== index) } }))} className="mt-7 rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600" aria-label={`Remove parameter ${index + 1}`}><Trash2 className="h-4 w-4" /></button></div>)}</div>
        <div className="mt-5"><h3 className="text-sm font-black text-slate-900">Return</h3><div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3"><Field label="Description"><textarea value={question.functionDescription.returnDescription} onChange={(event) => updateFunction("returnDescription", event.target.value)} rows={3} className={control} /></Field></div></div>
      </Section>

      <Section number={5} title="Constraints" description="Enter one constraint per line."><textarea value={constraintsText} onChange={(event) => setConstraintsText(event.target.value)} rows={6} className={`${area} font-mono text-xs`} /></Section>

      <Section number={6} title="Follow-up Questions" description="Questions an interviewer may ask after the primary solution."><textarea value={question.aiAnalysis.followUpQuestions} onChange={(event) => updateAnalysis("followUpQuestions", event.target.value)} rows={6} className={area} /></Section>

      <Section number={7} title="Approach" description="Explain the reasoning path before showing code.">
        <div className="grid gap-4"><Field label="Core Idea"><textarea value={question.approach.coreIdea} onChange={(event) => updateApproach("coreIdea", event.target.value)} className={area} /></Field><Field label="Algorithm Steps"><textarea value={question.approach.algorithmSteps} onChange={(event) => updateApproach("algorithmSteps", event.target.value)} rows={6} className={area} /></Field><Field label="Why This Works"><textarea value={question.approach.whyWorks} onChange={(event) => updateApproach("whyWorks", event.target.value)} className={area} /></Field><Field label="Edge Cases"><textarea value={question.approach.edgeCases} onChange={(event) => updateApproach("edgeCases", event.target.value)} className={area} /></Field></div>
      </Section>

      <Section number={8} title="Solution" description="Reference implementations are stored independently for each language.">
        <div className="flex w-fit rounded-lg bg-slate-100 p-1">{languages.map((language) => <button type="button" key={language.key} onClick={() => setActiveLanguage(language.key)} className={`rounded-md px-4 py-2 text-xs font-bold transition ${activeLanguage === language.key ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>{language.label}</button>)}</div>
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white"><Editor height="420px" language={activeMonacoLanguage} value={question.solution[activeLanguage]} onChange={(value) => updateSolution(value || "")} theme="vs-light" options={{ minimap: { enabled: false }, fontSize: 13, lineHeight: 21, automaticLayout: true, tabSize: 4, insertSpaces: true, wordWrap: "on", scrollBeyondLastLine: false, padding: { top: 14, bottom: 14 } }} /></div>
      </Section>

      <Section number={9} title="Complexity"><div className="grid gap-4 sm:grid-cols-2"><Field label="Time Complexity"><input value={question.complexity.time} onChange={(event) => updateComplexity("time", event.target.value)} placeholder="O(k log k)" className={control} /></Field><Field label="Space Complexity"><input value={question.complexity.space} onChange={(event) => updateComplexity("space", event.target.value)} placeholder="O(k)" className={control} /></Field></div></Section>

      <Section number={10} title="AI Analysis" description="Interview-focused insights shown in the AI Analysis tab.">
        <div className="grid gap-4"><Field label="Interview Intent"><textarea value={question.aiAnalysis.interviewIntent} onChange={(event) => updateAnalysis("interviewIntent", event.target.value)} className={area} /></Field><Field label="Key Concepts"><textarea value={question.aiAnalysis.keyConcepts} onChange={(event) => updateAnalysis("keyConcepts", event.target.value)} className={area} /></Field><Field label="Common Mistakes"><textarea value={question.aiAnalysis.commonMistakes} onChange={(event) => updateAnalysis("commonMistakes", event.target.value)} className={area} /></Field><Field label="Better Strategy"><textarea value={question.aiAnalysis.betterStrategy} onChange={(event) => updateAnalysis("betterStrategy", event.target.value)} className={area} /></Field></div>
      </Section>

      <div className="sticky bottom-4 z-10 flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur"><button disabled={pending || locked} onClick={save} className="rounded-xl border border-blue-200 px-5 py-2.5 text-sm font-bold text-blue-700 hover:bg-blue-50 disabled:opacity-50">{pending ? "Saving…" : "Save Changes"}</button><button disabled={pending || locked} onClick={approve} className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50">Approve & Create Problem</button><button disabled={pending || locked} onClick={reject} className="rounded-xl border border-rose-200 px-5 py-2.5 text-sm font-bold text-rose-700 hover:bg-rose-50 disabled:opacity-50">Reject</button>{problemSlug && <Link href={`/problem/${problemSlug}`} className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white">View Published Problem</Link>}</div>
      {message && <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm font-medium text-slate-700 shadow-sm">{message}</p>}
    </div>

    <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
      <div className={card}><h2 className="font-black text-slate-950">Missing Fields</h2>{savedMissingFields.length ? <><p className="mt-1 text-xs leading-5 text-slate-500">Optional fields do not block saving. Complete required publish fields during review.</p><div className="mt-3 flex flex-wrap gap-2">{savedMissingFields.map((field) => <span key={field} className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">{field}</span>)}</div></> : <p className="mt-2 text-sm font-medium text-emerald-700">No missing fields in the saved version.</p>}</div>
      <div className={card}><h2 className="font-black text-slate-950">Original Notion Content</h2><p className="mt-1 text-xs text-slate-400">Read-only source snapshot</p><pre className="mt-4 max-h-[72vh] overflow-auto whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-xs leading-6 text-slate-600">{rawContent || "No content."}</pre></div>
    </aside>
  </div>;
}

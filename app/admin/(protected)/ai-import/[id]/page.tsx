import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireCurrentAdmin } from "@/lib/admin-auth";
import { normalizeInterviewImportPayload } from "@/lib/interview-import-schema";
import { parseNotionInterviewQuestion } from "@/lib/interview-import-parser";
import type { NotionContentBlock } from "@/lib/notion-interviews";
import InterviewDraftEditor from "./StructuredInterviewDraftEditor";

export const dynamic = "force-dynamic";
export default async function ImportDraftPage({ params }: { params: Promise<{ id: string }> }) {
  await requireCurrentAdmin();
  const { id } = await params;
  const draftId = Number(id);
  if (!Number.isInteger(draftId)) notFound();
  const draft = await prisma.interviewImportDraft.findUnique({ where: { id: draftId } });
  if (!draft) notFound();
  const problem = draft.problemId ? await prisma.problem.findUnique({ where: { id: draft.problemId }, select: { slug: true } }) : null;
  const savedQuestion = normalizeInterviewImportPayload(draft.parsedPayload ?? draft.payload);
  const snapshot = Array.isArray(draft.sourceSnapshot) ? draft.sourceSnapshot as unknown as NotionContentBlock[] : [];
  const reparsedQuestion = snapshot.length ? parseNotionInterviewQuestion({ pageId: draft.notionPageId, title: draft.notionTitle || draft.notionName, company: draft.notionCompany || "", date: draft.notionDate || "", blocks: snapshot }) : null;
  const question = reparsedQuestion && reparsedQuestion.functionDescription.parameters.length > savedQuestion.functionDescription.parameters.length
    ? { ...savedQuestion, functionDescription: { ...savedQuestion.functionDescription, parameters: reparsedQuestion.functionDescription.parameters } }
    : savedQuestion;

  return <main className="min-h-screen bg-slate-50 py-8"><div className="mx-auto max-w-[1600px] px-4 sm:px-6"><Link href="/admin/ai-import" className="text-sm font-bold text-blue-600 hover:underline">← Back to Import Center</Link><div className="mt-4 flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-3xl font-black tracking-tight text-slate-950">Review Imported Question</h1><p className="mt-2 text-sm text-slate-500">{draft.notionTitle || draft.notionName} · {draft.notionCompany || "Unknown company"} · {draft.notionDate || "No date"}</p></div><span className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-extrabold text-white">{draft.status}</span></div><div className="mt-7"><InterviewDraftEditor draftId={draft.id} initial={question} rawContent={draft.rawContent} status={draft.status} missingFields={draft.missingFields} problemSlug={problem?.slug} /></div></div></main>;
}

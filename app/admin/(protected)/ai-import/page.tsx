import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { retryAsync } from "@/lib/retry";
import { isNotionInterviewImportConfigured, listNotionInterviewExperiences } from "@/lib/notion-interviews";
import { requireCurrentAdmin } from "@/lib/admin-auth";
import ImportCenterClient from "./ImportCenterClient";

export const dynamic = "force-dynamic";

export default async function AiImportPage() {
  await requireCurrentAdmin();

  const configured = isNotionInterviewImportConfigured();
  let sources: Awaited<ReturnType<typeof listNotionInterviewExperiences>> = [];
  let drafts: Array<{ id: number; notionPageId: string; status: string; missingFields: string[]; importedAt: Date; problemId: number | null }> = [];
  let notionError = "";
  let databaseError = "";

  if (configured) {
    try {
      sources = await listNotionInterviewExperiences();
    } catch (cause) {
      notionError = cause instanceof Error ? cause.message : "Unable to read Notion.";
    }
  }

  try {
    drafts = await retryAsync(
      () => prisma.interviewImportDraft.findMany({
        orderBy: { importedAt: "desc" },
        select: { id: true, notionPageId: true, status: true, missingFields: true, importedAt: true, problemId: true },
      }),
      { attempts: 3, delayMs: 400 },
    );
  } catch (cause) {
    databaseError = cause instanceof Error ? cause.message : "Unable to read import drafts.";
    console.error("[AI Import] Draft query failed after retries", cause);
  }

  return <main className="min-h-screen bg-slate-50 py-8"><div className="mx-auto max-w-7xl px-4 sm:px-6">
    <Link href="/admin" className="text-sm font-bold text-blue-600 hover:underline">← Back to Dashboard</Link>
    <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Interview Import Center</h1>
    <p className="mt-2 text-sm text-slate-500">Read every structured interview record from Notion, preview the parser result, then create a reviewable draft.</p>

    {!configured && <div className="mt-7 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900"><b>Notion is not configured.</b><p className="mt-1">Add <code>NOTION_TOKEN</code> and <code>NOTION_INTERVIEW_DATABASE_ID</code>, then share the database with a read-only Notion integration.</p></div>}
    {notionError && <div className="mt-7 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800"><b>Notion is temporarily unavailable.</b><p className="mt-1 break-words">{notionError}</p><p className="mt-2">Refresh this page to retry.</p></div>}
    {databaseError && <div className="mt-7 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800"><b>Draft database is temporarily unavailable.</b><p className="mt-1 break-words">{databaseError}</p><p className="mt-2">The page stayed available. Refresh to retry the Neon connection.</p></div>}
    {configured && !notionError && !databaseError && <div className="mt-7"><ImportCenterClient sources={sources} drafts={drafts.map((draft) => ({ ...draft, importedAt: draft.importedAt.toISOString() }))} /></div>}
  </div></main>;
}

"use server";
import { revalidatePath } from "next/cache";
import { requireCurrentAdmin } from "@/lib/admin-auth";
import { createImportDraft, previewNotionImport, publishImportDraft, rejectImportDraft, saveImportDraft } from "@/lib/interview-import";

export async function previewImportAction(pageId: string) {
  await requireCurrentAdmin();
  try {
    return { ok: true as const, data: await previewNotionImport(pageId) };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[Interview Import Preview] Failed", { pageId, error });
    return { ok: false as const, error: message };
  }
}
export async function confirmImportAction(pageId: string) { await requireCurrentAdmin(); const draft = await createImportDraft(pageId); revalidatePath("/admin/ai-import"); return { id: draft.id, status: draft.status }; }
export async function saveImportDraftAction(draftId: number, payloadJson: string) { await requireCurrentAdmin(); let payload: unknown; try { payload = JSON.parse(payloadJson); } catch { throw new Error("Draft data is not valid JSON."); } const draft = await saveImportDraft(draftId, payload); revalidatePath("/admin/ai-import"); revalidatePath(`/admin/ai-import/${draftId}`); return { status: draft.status, missingFields: draft.missingFields }; }
export async function rejectImportDraftAction(draftId: number) { await requireCurrentAdmin(); await rejectImportDraft(draftId); revalidatePath("/admin/ai-import"); revalidatePath(`/admin/ai-import/${draftId}`); }
export async function publishImportDraftAction(draftId: number) { await requireCurrentAdmin(); const problem = await publishImportDraft(draftId); revalidatePath("/"); revalidatePath("/problem"); revalidatePath("/admin/problems"); revalidatePath("/admin/ai-import"); revalidatePath(`/admin/ai-import/${draftId}`); return { slug: problem.slug }; }

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createUniqueProblemSlug } from "@/lib/slug";
import { resolveSolution } from "@/lib/solution-language";
import { getNotionInterviewSource } from "@/lib/notion-interviews";
import { blocksToPlainText, parseNotionInterviewQuestion } from "@/lib/interview-import-parser";
import { formatLegacyExamples, normalizeImportQuestion, validateImportQuestion, type ImportQuestion } from "@/lib/interview-import-schema";

import { normalizeInterviewImportPayload, toLegacyImportQuestion, validateInterviewImportPayload } from '@/lib/interview-import-schema';

export async function previewNotionImport(pageId: string) {
  const source = await getNotionInterviewSource(pageId);
  const parsedPayload = parseNotionInterviewQuestion(source);
  const question = toLegacyImportQuestion(parsedPayload);
  const validation = validateInterviewImportPayload(parsedPayload);
  return { source: { pageId: source.pageId, title: source.title, company: source.company, date: source.date }, rawContent: blocksToPlainText(source.blocks), sourceSnapshot: source.blocks, parsedPayload, question, ...validation };
}

export async function createImportDraft(pageId: string) {
  const preview = await previewNotionImport(pageId);
  const existing = await prisma.interviewImportDraft.findUnique({ where: { notionPageId: pageId } });
  if (existing?.status === "PUBLISHED") throw new Error("This Notion record has already been published.");
  const status = preview.valid ? 'IMPORTED' : 'FAILED';
  const validationError = preview.valid ? null : `Missing required fields: ${preview.requiredMissingFields.join(', ')}`;
  return prisma.interviewImportDraft.upsert({
    where: { notionPageId: pageId },
    create: { notionPageId: pageId, notionTitle: preview.source.title, notionName: preview.source.title, notionCompany: preview.source.company, notionDate: preview.source.date || null, rawContent: preview.rawContent, sourceSnapshot: preview.sourceSnapshot as Prisma.InputJsonValue, parsedPayload: preview.parsedPayload as Prisma.InputJsonValue, payload: preview.question as Prisma.InputJsonValue, status, missingFields: preview.missingFields, validationError },
    update: { notionTitle: preview.source.title, notionName: preview.source.title, notionCompany: preview.source.company, notionDate: preview.source.date || null, rawContent: preview.rawContent, sourceSnapshot: preview.sourceSnapshot as Prisma.InputJsonValue, parsedPayload: preview.parsedPayload as Prisma.InputJsonValue, payload: preview.question as Prisma.InputJsonValue, status, missingFields: preview.missingFields, validationError, importedAt: new Date(), reviewedAt: null, rejectedAt: null },
  });
}

export async function saveImportDraft(draftId: number, value: unknown) {
  const parsedPayload = normalizeInterviewImportPayload(value);
  const question = toLegacyImportQuestion(parsedPayload);
  const validation = validateInterviewImportPayload(parsedPayload);
  return prisma.interviewImportDraft.update({ where: { id: draftId }, data: { payload: question as Prisma.InputJsonValue, parsedPayload: parsedPayload as Prisma.InputJsonValue, status: validation.valid ? 'IMPORTED' : 'FAILED', missingFields: validation.missingFields, validationError: validation.valid ? null : `Missing required fields: ${validation.requiredMissingFields.join(', ')}`, reviewedAt: new Date() } });
}

export async function rejectImportDraft(draftId: number) {
  const draft = await prisma.interviewImportDraft.findUnique({ where: { id: draftId } });
  if (!draft) throw new Error("Import draft not found.");
  if (draft.status === "PUBLISHED") throw new Error("Published drafts cannot be rejected.");
  return prisma.interviewImportDraft.update({ where: { id: draftId }, data: { status: "REJECTED", rejectedAt: new Date() } });
}

export async function publishImportDraft(draftId: number) {
  const draft = await prisma.interviewImportDraft.findUnique({ where: { id: draftId } });
  if (!draft) throw new Error("Import draft not found.");
  if (draft.status === "PUBLISHED" || draft.problemId) throw new Error("This draft has already been published.");
  const question = normalizeImportQuestion(draft.payload); const validation = validateImportQuestion(question);
  if (!validation.valid) { await prisma.interviewImportDraft.update({ where: { id: draftId }, data: { status: "DRAFT", missingFields: validation.missingFields, validationError: `Missing fields: ${validation.missingFields.join(", ")}` } }); throw new Error(`Cannot approve yet. Missing: ${validation.missingFields.join(", ")}`); }
  const { code: solution, language: solutionLanguage } = resolveSolution(question.solution || question.solutionPython || question.solutionJava || question.solutionCpp, question.solutionLanguage);
  const slug = await createUniqueProblemSlug(question.title);
  return prisma.$transaction(async (tx) => {
    const problem = await tx.problem.create({ data: { slug, title: question.title, company: question.company, role: question.role, difficulty: question.difficulty, stage: question.stage, category: question.category, description: question.description, example: formatLegacyExamples(question.examples), approach: question.approach || question.approachSteps, solution, solutionLanguage, similarProblems: "", timeComplexity: question.timeComplexity, spaceComplexity: question.spaceComplexity, topics: question.topics.length ? question.topics : [question.category], examples: question.examples as Prisma.InputJsonValue, functionName: question.functionName, functionParameters: question.functionParameters, returnDescription: question.returnDescription, constraints: question.constraints, approachHowToThink: question.approachHowToThink || null, approachObservations: question.approachObservations || null, approachSteps: question.approachSteps || question.approach, solutionPython: question.solutionPython || (solutionLanguage === "python" ? solution : null), solutionJava: question.solutionJava || (solutionLanguage === "java" ? solution : null), solutionCpp: question.solutionCpp || (solutionLanguage === "cpp" ? solution : null), aiInterviewFocus: question.aiInterviewFocus || null, aiKeyConcepts: question.aiKeyConcepts || null, aiCommonMistakes: question.aiCommonMistakes || null, aiFollowUpQuestions: question.aiFollowUpQuestions || null, aiBetterStrategy: question.aiBetterStrategy || null } });
    await tx.interviewImportDraft.update({ where: { id: draftId }, data: { status: "PUBLISHED", problemId: problem.id, publishedAt: new Date(), missingFields: [], validationError: null } });
    return problem;
  });
}

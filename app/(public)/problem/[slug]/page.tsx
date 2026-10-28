import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isDatabaseDisabled } from "@/lib/db-mode";
import { getCurrentUser } from "@/lib/user-auth";
import { problems as fallbackProblems } from "@/data/problems";
import { retryAsync } from "@/lib/retry";
import { normalizeInterviewImportPayload } from "@/lib/interview-import-schema";
import { parseNotionInterviewQuestion } from "@/lib/interview-import-parser";
import type { NotionContentBlock } from "@/lib/notion-interviews";
import { normalizeProblemFunctionDescription } from "@/lib/problem-function";
import ProblemWorkspace from "@/components/ProblemWorkspace";
import { hasProAccess } from "@/lib/billing/entitlements";
import { isPaywallEnabled } from "@/lib/site-settings";
import AccountAccessGate from "@/components/AccountAccessGate";

type Props = { params: Promise<{ slug: string }> };
export const dynamic = "force-dynamic";

async function findProblem(slug: string) {
  const decodedSlug = decodeURIComponent(slug);
  const fallback = fallbackProblems.find((item) => item.slug === slug || item.slug === decodedSlug || String(item.id) === slug);
  if (isDatabaseDisabled()) return fallback ?? null;
  return retryAsync(() => prisma.problem.findFirst({ where: { OR: [{ slug }, { slug: decodedSlug }] } })).catch(() => fallback ?? null);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const problem = await findProblem(slug);
  if (!problem) return { title: "Problem Not Found" };
  return { title: `${problem.title} | Coding Interview Workspace`, description: `Practice ${problem.company} interview problem ${problem.title} in the EchoINTV coding workspace.` };
}

export default async function ProblemDetailPage({ params }: Props) {
  const { slug } = await params;
  const session = await getCurrentUser();
  const problem = await findProblem(slug);
  if (!problem) notFound();

  const importDraft = isDatabaseDisabled() ? null : await retryAsync(() => prisma.interviewImportDraft.findFirst({ where: { problemId: problem.id }, select: { notionPageId: true, notionTitle: true, notionName: true, notionCompany: true, notionDate: true, parsedPayload: true, sourceSnapshot: true } })).catch(() => null);
  const savedImportPayload = importDraft?.parsedPayload ? normalizeInterviewImportPayload(importDraft.parsedPayload) : undefined;
  const snapshot = importDraft && Array.isArray(importDraft.sourceSnapshot) ? importDraft.sourceSnapshot as unknown as NotionContentBlock[] : [];
  const reparsedImportPayload = importDraft && snapshot.length ? parseNotionInterviewQuestion({ pageId: importDraft.notionPageId, title: importDraft.notionTitle || importDraft.notionName, company: importDraft.notionCompany || "", date: importDraft.notionDate || "", blocks: snapshot }) : undefined;
  const importedFunctionDescription = reparsedImportPayload && reparsedImportPayload.functionDescription.parameters.length > (savedImportPayload?.functionDescription.parameters.length || 0)
    ? { ...savedImportPayload?.functionDescription, ...reparsedImportPayload.functionDescription }
    : savedImportPayload?.functionDescription;
  const functionDescription = normalizeProblemFunctionDescription(importedFunctionDescription, {
    functionName: "functionName" in problem ? problem.functionName : undefined,
    functionParameters: "functionParameters" in problem ? problem.functionParameters : undefined,
    returnDescription: "returnDescription" in problem ? problem.returnDescription : undefined,
  });

  const freeProblems = isDatabaseDisabled() ? [] : await retryAsync(() => prisma.problem.findMany({ take: 6, orderBy: { id: "asc" }, select: { id: true } })).catch(() => []);
  const isFree = typeof (problem as { isFree?: boolean }).isFree === "boolean" ? Boolean((problem as { isFree?: boolean }).isFree) : freeProblems.some((item) => item.id === problem.id);
  const adminEmails = ["admin@echointv.com", "shihaoy74@gmail.com"];
  const isAdmin = Boolean(session?.email && adminEmails.includes(session.email.toLowerCase().trim()));
  const paywallEnabled = await isPaywallEnabled();
  const canAccess = !paywallEnabled || isFree || isAdmin || Boolean(session && await hasProAccess(session.id));
  const [progressRecord, favoriteRecord] = session && !isDatabaseDisabled() ? await Promise.all([
    prisma.userProblemProgress.findUnique({ where: { userId_problemId: { userId: session.id, problemId: problem.id } }, select: { id: true } }),
    prisma.favorite.findUnique({ where: { userId_problemId: { userId: session.id, problemId: problem.id } }, select: { id: true } }),
  ]) : [null, null];

  return <AccountAccessGate isAuthenticated={Boolean(session)} contentType="problem" returnPath={`/problem/${slug}`}><ProblemWorkspace problem={{
    slug: problem.slug || slug,
    title: problem.title,
    company: problem.company,
    difficulty: problem.difficulty,
    category: problem.category,
    description: problem.description,
    example: problem.example,
    approach: problem.approach,
    solution: problem.solution,
    solutionLanguage: "solutionLanguage" in problem ? problem.solutionLanguage : undefined,
    topics: problem.topics || [],
    timeComplexity: problem.timeComplexity,
    spaceComplexity: problem.spaceComplexity,
    examples: "examples" in problem && Array.isArray(problem.examples) ? problem.examples as { input: string; output: string; explanation: string }[] : undefined,
    functionDescription,
    constraints: "constraints" in problem ? problem.constraints : undefined,
    approachHowToThink: "approachHowToThink" in problem ? problem.approachHowToThink || undefined : undefined,
    approachObservations: "approachObservations" in problem ? problem.approachObservations || undefined : undefined,
    approachSteps: "approachSteps" in problem ? problem.approachSteps || undefined : undefined,
    solutionPython: "solutionPython" in problem ? problem.solutionPython || undefined : undefined,
    solutionJava: "solutionJava" in problem ? problem.solutionJava || undefined : undefined,
    solutionCpp: "solutionCpp" in problem ? problem.solutionCpp || undefined : undefined,
    aiInterviewFocus: "aiInterviewFocus" in problem ? problem.aiInterviewFocus || undefined : undefined,
    aiKeyConcepts: "aiKeyConcepts" in problem ? problem.aiKeyConcepts || undefined : undefined,
    aiCommonMistakes: "aiCommonMistakes" in problem ? problem.aiCommonMistakes || undefined : undefined,
    aiFollowUpQuestions: "aiFollowUpQuestions" in problem ? problem.aiFollowUpQuestions || undefined : undefined,
    aiBetterStrategy: "aiBetterStrategy" in problem ? problem.aiBetterStrategy || undefined : undefined,
  }} canAccess={canAccess} problemId={problem.id} initialSolved={Boolean(progressRecord)} initialFavorited={Boolean(favoriteRecord)} /></AccountAccessGate>;
}

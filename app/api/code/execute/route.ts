import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { buildJudgeSource } from "@/lib/code-harness";
import { executeWithJudge0, type JudgeLanguage } from "@/lib/judge0";
import { getCurrentUser } from "@/lib/user-auth";
import { prisma } from "@/lib/prisma";
import { isDatabaseDisabled } from "@/lib/db-mode";
import { isPaywallEnabled } from "@/lib/site-settings";
import { hasProAccess } from "@/lib/billing/entitlements";
import { decideContentAccess } from "@/lib/content-access";

export async function POST(request: Request) {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "Please sign in to run code." }, { status: 401 });

  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const key = `judge0:${session.id}:${forwarded || "unknown"}`;
  if (!rateLimit(key, 8, 60_000).success) return NextResponse.json({ error: "Too many code runs. Please wait one minute." }, { status: 429 });

  try {
    const body = await request.json() as { problemId?: number; language?: string; code?: string; input?: string; functionName?: string; parameters?: { name?: string; type?: string }[] };
    if (!Number.isInteger(body.problemId) || Number(body.problemId) <= 0) return NextResponse.json({ error: "A valid problem is required." }, { status: 400 });
    if (isDatabaseDisabled()) return NextResponse.json({ error: "Code execution is unavailable while the database is offline." }, { status: 503 });

    const [problem, freeProblems, paywallEnabled, proAccess] = await Promise.all([
      prisma.problem.findUnique({ where: { id: Number(body.problemId) } }),
      prisma.problem.findMany({ take: 6, orderBy: { id: "asc" }, select: { id: true } }),
      isPaywallEnabled(),
      hasProAccess(session.id),
    ]);
    if (!problem) return NextResponse.json({ error: "Problem not found." }, { status: 404 });
    const access = decideContentAccess({
      isAuthenticated: true,
      paywallEnabled,
      isFree: typeof (problem as { isFree?: boolean }).isFree === "boolean"
        ? Boolean((problem as { isFree?: boolean }).isFree)
        : freeProblems.some((item) => item.id === problem.id),
      isAdmin: session.role === "ADMIN",
      hasProAccess: proAccess,
    });
    if (!access.allowed) return NextResponse.json({ error: "A Pro membership is required to run this problem." }, { status: 403 });
    if (body.language !== "Java" && body.language !== "C++" && body.language !== "JavaScript" && body.language !== "SQL") return NextResponse.json({ error: "Only Java, C++, JavaScript, and SQL are supported by this endpoint." }, { status: 400 });
    if (!body.code?.trim()) return NextResponse.json({ error: "Source code is required." }, { status: 400 });
    if (body.code.length > 50_000 || (body.input?.length || 0) > 20_000) return NextResponse.json({ error: "Code or input is too large." }, { status: 413 });
    const parameters = Array.isArray(body.parameters) ? body.parameters.map((item) => ({ name: String(item.name || ""), type: String(item.type || "") })) : [];
    const prepared = buildJudgeSource(body.language as JudgeLanguage, body.code, body.input || "", body.functionName || "", parameters);
    return NextResponse.json(await executeWithJudge0(body.language as JudgeLanguage, prepared.sourceCode, prepared.stdin));
  } catch (error) {
    console.error("Judge0 execution failed", error);
    const message = error instanceof Error && error.name === "AbortError" ? "Judge0 execution timed out." : error instanceof Error ? error.message : "Code execution failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

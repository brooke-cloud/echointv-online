import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";
import { isPaywallEnabled } from "@/lib/site-settings";
import { hasProAccess } from "@/lib/billing/entitlements";
import { decideContentAccess } from "@/lib/content-access";

export async function POST(req: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { problemId, status = "SOLVED" } = await req.json() as { problemId?: number; status?: string };
    if (!Number.isInteger(problemId) || Number(problemId) <= 0 || status !== "SOLVED") {
      return NextResponse.json({ error: "A valid problem and status are required." }, { status: 400 });
    }

    const [problem, freeProblems, paywallEnabled, proAccess] = await Promise.all([
      prisma.problem.findUnique({ where: { id: Number(problemId) }, select: { id: true, isFree: true } }),
      prisma.problem.findMany({ take: 6, orderBy: { id: "asc" }, select: { id: true } }),
      isPaywallEnabled(),
      hasProAccess(session.id),
    ]);
    if (!problem) return NextResponse.json({ error: "Problem not found." }, { status: 404 });

    const access = decideContentAccess({
      isAuthenticated: true,
      paywallEnabled,
      isFree: problem.isFree || freeProblems.some((item) => item.id === problem.id),
      isAdmin: session.role === "ADMIN",
      hasProAccess: proAccess,
    });
    if (!access.allowed) {
      return NextResponse.json({ error: "A Pro membership is required to save progress for this problem." }, { status: 403 });
    }

    await prisma.userProblemProgress.upsert({
      where: { userId_problemId: { userId: session.id, problemId: problem.id } },
      create: { userId: session.id, problemId: problem.id, status: "SOLVED" },
      update: { status: "SOLVED" },
    });
    return NextResponse.json({ isSolved: true, message: "Progress saved." });
  } catch (error) {
    console.error("Progress error:", error);
    return NextResponse.json({ error: "Unable to save progress." }, { status: 500 });
  }
}

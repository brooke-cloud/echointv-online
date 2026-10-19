import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { buildJudgeSource } from "@/lib/code-harness";
import { executeWithJudge0, type JudgeLanguage } from "@/lib/judge0";

export async function POST(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const key = `judge0:${forwarded || "unknown"}`;
  if (!rateLimit(key, 8, 60_000).success) return NextResponse.json({ error: "Too many code runs. Please wait one minute." }, { status: 429 });

  try {
    const body = await request.json() as { language?: string; code?: string; input?: string; functionName?: string; parameters?: { name?: string; type?: string }[] };
    if (body.language !== "Java" && body.language !== "C++") return NextResponse.json({ error: "Only Java and C++ are supported by this endpoint." }, { status: 400 });
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

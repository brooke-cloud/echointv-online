import { NextResponse } from "next/server";
import { requireCurrentAdmin } from "@/lib/admin-auth";

export async function POST() {
  try { await requireCurrentAdmin(); }
  catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }
  return NextResponse.json({ error: "AI generation is retired. Use the Notion read-only preview and import workflow." }, { status: 410 });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";

export async function POST(req: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { problemId, status = "SOLVED" } = await req.json();
    if (!problemId) {
      return NextResponse.json({ error: "缺少 problemId" }, { status: 400 });
    }

    const existing = await (prisma as any).userProblemProgress.findUnique({
      where: {
        userId_problemId: {
          userId: session.id,
          problemId: Number(problemId),
        },
      },
    });

    if (existing) {
      await (prisma as any).userProblemProgress.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ isSolved: false, message: "已取消打卡" });
    } else {
      await (prisma as any).userProblemProgress.create({
        data: {
          userId: session.id,
          problemId: Number(problemId),
          status,
        },
      });
      return NextResponse.json({ isSolved: true, message: "打卡成功！" });
    }
  } catch (error) {
    console.error("Progress error:", error);
    return NextResponse.json({ error: "操作失败" }, { status: 500 });
  }
}
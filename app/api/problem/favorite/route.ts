import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";

export async function POST(req: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { problemId } = await req.json();
    if (!problemId) {
      return NextResponse.json({ error: "缺少 problemId" }, { status: 400 });
    }

    const existing = await (prisma as any).favorite.findUnique({
      where: {
        userId_problemId: {
          userId: session.id,
          problemId: Number(problemId),
        },
      },
    });

    if (existing) {
      await (prisma as any).favorite.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ isFavorited: false, message: "已取消收藏" });
    } else {
      await (prisma as any).favorite.create({
        data: {
          userId: session.id,
          problemId: Number(problemId),
        },
      });
      return NextResponse.json({ isFavorited: true, message: "已加入收藏！" });
    }
  } catch (error) {
    console.error("Favorite error:", error);
    return NextResponse.json({ error: "操作失败" }, { status: 500 });
  }
}
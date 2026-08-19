import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return Response.json({ error: "请先登录" }, { status: 401 });
    }

    const { problemId, status } = await request.json();

    if (!problemId) {
      return Response.json({ error: "缺少题目 ID" }, { status: 400 });
    }

    // 如果状态为 NONE，表示取消标记
    if (status === "NONE") {
      await prisma.userProblemProgress.deleteMany({
        where: {
          userId: user.id,
          problemId: problemId,
        },
      });
      return Response.json({ success: true, status: "NONE" });
    }

    // 记录或更新为 SOLVED
    const progress = await prisma.userProblemProgress.upsert({
      where: {
        userId_problemId: {
          userId: user.id,
          problemId: problemId,
        },
      },
      update: {
        status: status || "SOLVED",
      },
      create: {
        userId: user.id,
        problemId: problemId,
        status: status || "SOLVED",
      },
    });

    return Response.json({ success: true, progress });
  } catch (error) {
    console.error("更新打卡进度异常:", error);
    return Response.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
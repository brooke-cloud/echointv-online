import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return Response.json({ error: "请先登录" }, { status: 401 });
    }

    const { problemId, isFavorite } = await request.json();

    if (!problemId) {
      return Response.json({ error: "缺少题目 ID" }, { status: 400 });
    }

    if (isFavorite) {
      // 添加收藏
      await prisma.favorite.upsert({
        where: {
          userId_problemId: {
            userId: user.id,
            problemId: problemId,
          },
        },
        update: {},
        create: {
          userId: user.id,
          problemId: problemId,
        },
      });
    } else {
      // 取消收藏
      await prisma.favorite.deleteMany({
        where: {
          userId: user.id,
          problemId: problemId,
        },
      });
    }

    return Response.json({ success: true, isFavorite });
  } catch (error) {
    console.error("更新收藏状态异常:", error);
    return Response.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
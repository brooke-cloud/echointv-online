// app/api/webhooks/afdian/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. 校验爱发电推送数据
    if (body.data?.type === "order") {
      const order = body.data.order;
      const status = order.status; // 2 表示交易成功

      if (status === 2) {
        // 提取用户标识（可通过 custom_order_id 或 remark 备注传递用户 ID / 邮箱）
        const userId = order.custom_order_id;
        const remark = order.remark ? order.remark.toLowerCase().trim() : "";

        // 查找对应用户
        const targetUser = await prisma.user.findFirst({
          where: {
            OR: [
              ...(userId ? [{ id: userId }] : []),
              ...(remark ? [{ email: remark }] : []),
            ],
          },
        });

        // 自动升级为 PRO 会员
        if (targetUser) {
          await prisma.user.update({
            where: { id: targetUser.id },
            data: { role: "PRO" },
          });
          console.log(`[爱发电] 用户 ${targetUser.email} 付款成功，已自动升级为 Pro 会员！`);
        }
      }
    }

    // 必须返回爱发电规定的成功格式
    return NextResponse.json({ ec: 200, em: "ok" });
  } catch (error) {
    console.error("爱发电 Webhook 异常:", error);
    return NextResponse.json({ ec: 500, em: "error" }, { status: 500 });
  }
}
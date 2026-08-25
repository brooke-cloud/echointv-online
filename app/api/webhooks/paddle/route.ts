// app/api/webhooks/paddle/route.ts

import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";

// 验证 Paddle 签名
function verifyPaddleSignature(
  rawBody: string,
  signatureHeader: string,
  secretKey: string
): boolean {
  if (!signatureHeader || !secretKey) return false;

  const parts = signatureHeader.split(";");
  let timestamp = "";
  let h1 = "";

  for (const part of parts) {
    const [k, v] = part.split("=");
    if (k === "ts") timestamp = v;
    if (k === "h1") h1 = v;
  }

  if (!timestamp || !h1) return false;

  const signedPayload = `${timestamp}:${rawBody}`;
  const expectedH1 = createHmac("sha256", secretKey)
    .update(signedPayload)
    .digest("hex");

  return timingSafeEqual(Buffer.from(h1), Buffer.from(expectedH1));
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("paddle-signature") || "";
    const secretKey = process.env.PADDLE_WEBHOOK_SECRET_KEY || "";

    // 1. 安全签名校验
    if (secretKey) {
      const isValid = verifyPaddleSignature(rawBody, signature, secretKey);
      if (!isValid) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event_type;
    const data = event.data;

    // 2. 监听支付成功或订阅创建事件
    if (
      eventType === "transaction.completed" ||
      eventType === "subscription.created" ||
      eventType === "subscription.activated"
    ) {
      // 提取我们传入的用户 ID
      const userId = data.custom_data?.userId || data.custom_data?.user_id;

      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: { role: "PRO" },
        });
        console.log(`[Paddle] 用户 ${userId} 支付成功，已自动升级为 Pro 会员！`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Paddle Webhook 异常:", error);
    return NextResponse.json({ error: "Webhook 处理失败" }, { status: 500 });
  }
}
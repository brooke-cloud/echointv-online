// app/api/auth/send-code/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "请输入有效的邮箱地址" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. 检查邮箱是否已被注册
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json({ error: "该邮箱已被注册，请直接登录" }, { status: 400 });
    }

    // 2. 生成 6 位随机纯数字验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10分钟有效

    // 3. 清理旧验证码，写入新验证码
    await prisma.verificationCode.deleteMany({
      where: { email: cleanEmail },
    });

    await prisma.verificationCode.create({
      data: {
        email: cleanEmail,
        code,
        expiresAt,
      },
    });

    // 4. 发送邮件
    await sendVerificationEmail(cleanEmail, code);

    return NextResponse.json({ success: true, message: "验证码已发送至您的邮箱" });
  } catch (error: any) {
    console.error("发送验证码失败详情:", error);
    
    // 动态判断错误原因
    const isAuthError = error?.message?.includes("535") || error?.responseCode === 535;
    const errorMsg = isAuthError
      ? "QQ 邮箱授权码错误，请确认 .env 中的 16 位授权码是否正确"
      : (error?.message || "邮件发送失败，请稍后重试");

    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
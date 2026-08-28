// app/api/admin/users/[id]/set-pro/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";

const ADMIN_EMAILS = ["admin@echointv.com", "shihaoy74@gmail.com"];

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { id: session.id },
    });

    const isEmailAdmin =
      admin?.email && ADMIN_EMAILS.includes(admin.email.toLowerCase().trim());
    if (admin?.role !== "ADMIN" && !isEmailAdmin) {
      return NextResponse.json({ error: "无权操作" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { days, action } = body;

    const targetUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    if (targetUser.role === "ADMIN") {
      return NextResponse.json({ error: "不可修改系统管理员" }, { status: 400 });
    }

    // 1. 取消会员资格
    if (action === "revoke") {
      await prisma.user.update({
        where: { id },
        data: {
          role: "USER",
          proExpiresAt: null,
        } as any,
      });
      return NextResponse.json({ success: true, message: "已取消 Pro 会员" });
    }

    // 2. 开通 / 续期设置会员天数
    const numDays = parseInt(days, 10);
    if (isNaN(numDays) || numDays <= 0) {
      return NextResponse.json({ error: "请输入有效的天数" }, { status: 400 });
    }

    const now = new Date();
    const userExpiresAt = (targetUser as any).proExpiresAt;
    const baseDate =
      userExpiresAt && new Date(userExpiresAt) > now
        ? new Date(userExpiresAt)
        : now;

    const newExpiresAt = new Date(baseDate.getTime() + numDays * 24 * 60 * 60 * 1000);
    const newStartedAt = (targetUser as any).proStartedAt || now;

    await prisma.user.update({
      where: { id },
      data: {
        role: "PRO",
        proStartedAt: newStartedAt,
        proExpiresAt: newExpiresAt,
      } as any,
    });

    return NextResponse.json({
      success: true,
      message: `成功为用户设置 ${numDays} 天会员！`,
      expiresAt: newExpiresAt,
    });
  } catch (error: any) {
    console.error("设置会员时长失败:", error);
    return NextResponse.json({ error: error.message || "操作失败" }, { status: 500 });
  }
}
// app/api/admin/users/[id]/toggle-pro/route.ts

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

    const currentAdmin = await prisma.user.findUnique({
      where: { id: session.id },
    });

    const isEmailAdmin =
      currentAdmin?.email &&
      ADMIN_EMAILS.includes(currentAdmin.email.toLowerCase().trim());

    if (!isEmailAdmin && currentAdmin?.role !== "ADMIN") {
      return NextResponse.json({ error: "无权操作" }, { status: 403 });
    }

    const { id } = await params;
    const targetUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    if (targetUser.role === "ADMIN") {
      return NextResponse.json({ error: "无法修改超级管理员" }, { status: 400 });
    }

    // 切换身份：USER <-> PRO
    const newRole = targetUser.role === "PRO" ? "USER" : "PRO";

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role: newRole },
    });

    return NextResponse.json({
      success: true,
      role: updatedUser.role,
      message: newRole === "PRO" ? "已开通 Pro 会员" : "已降级为普通用户",
    });
  } catch (error: any) {
    console.error("Toggle Pro 异常:", error);
    return NextResponse.json({ error: error.message || "操作失败" }, { status: 500 });
  }
}
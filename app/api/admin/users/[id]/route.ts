// app/api/admin/users/[id]/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";

const ADMIN_EMAILS = ["admin@echointv.com", "shihaoy74@gmail.com"];

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentUser();
    if (!session) return NextResponse.json({ error: "未登录" }, { status: 401 });

    const admin = await prisma.user.findUnique({ where: { id: session.id } });
    const isEmailAdmin = admin?.email && ADMIN_EMAILS.includes(admin.email.toLowerCase().trim());
    if (admin?.role !== "ADMIN" && !isEmailAdmin) {
      return NextResponse.json({ error: "无权操作" }, { status: 403 });
    }

    const { id } = await params;
    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    if (targetUser.role === "ADMIN") {
      return NextResponse.json({ error: "不可删除管理员账号" }, { status: 400 });
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "用户已彻底删除" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "删除失败" }, { status: 500 });
  }
}
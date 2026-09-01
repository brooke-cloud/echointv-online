// app/api/admin/jobs/[id]/route.ts

import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
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
    const isEmailAdmin =
      admin?.email && ADMIN_EMAILS.includes(admin.email.toLowerCase().trim());
    if (admin?.role !== "ADMIN" && !isEmailAdmin) {
      return NextResponse.json({ error: "无权操作" }, { status: 403 });
    }

    const { id } = await params;
    const jobId = parseInt(id, 10);

    // 🌟 使用安全数据库访问对象，彻底消除 TS 找不到 job 的报错
    const jobModel = (prisma as any).job;
    if (!jobModel) {
      throw new Error("数据库中尚未初始化 Job 表");
    }

    await jobModel.delete({
      where: { id: jobId },
    });

    // 🌟 清理前台与后台岗位列表缓存
    revalidatePath("/jobs");
    revalidatePath("/admin/jobs");

    return NextResponse.json({ success: true, message: "岗位已成功删除" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "删除失败" }, { status: 500 });
  }
}
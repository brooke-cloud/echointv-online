// app/admin/(protected)/jobs/actions.ts

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";
import { syncAllCompanies } from "@/lib/jobs/sync";

const ADMIN_EMAILS = [
  "admin@echointv.com",
  "shihaoy74@gmail.com",
];

async function requireAdmin() {
  const session = await getCurrentUser();

  if (!session) {
    throw new Error("请先登录管理员账号");
  }

  const admin = await prisma.user.findUnique({
    where: {
      id: session.id,
    },
    select: {
      id: true,
      email: true,
      role: true,
    },
  });

  if (!admin) {
    throw new Error("管理员账号不存在");
  }

  const isEmailAdmin =
    !!admin.email &&
    ADMIN_EMAILS.includes(
      admin.email.toLowerCase().trim()
    );

  if (admin.role !== "ADMIN" && !isEmailAdmin) {
    throw new Error("无管理员操作权限");
  }

  return admin;
}

/**
 * 管理员手动触发全站岗位同步。
 *
 * 真正的同步逻辑统一放在：
 * lib/jobs/sync.ts
 *
 * 这样：
 * - Cron
 * - API
 * - Admin 后台按钮
 *
 * 都使用同一套同步引擎。
 */
export async function syncJobsAction() {
  await requireAdmin();

  const result = await syncAllCompanies();

  revalidatePath("/jobs");
  revalidatePath("/admin/jobs");

  return result;
}

/**
 * 删除单个岗位
 *
 * 当前 Prisma Job.id 是 String/cuid()，
 * 不能再使用旧版 number。
 */
export async function deleteJobAction(jobId: string) {
  await requireAdmin();

  if (!jobId || typeof jobId !== "string") {
    throw new Error("无效的岗位 ID");
  }

  const job = await prisma.job.findUnique({
    where: {
      id: jobId,
    },
    select: {
      id: true,
      title: true,
    },
  });

  if (!job) {
    throw new Error("岗位不存在，可能已经被删除");
  }

  await prisma.job.delete({
    where: {
      id: jobId,
    },
  });

  revalidatePath("/jobs");
  revalidatePath("/admin/jobs");

  return {
    success: true,
    deletedId: jobId,
  };
}
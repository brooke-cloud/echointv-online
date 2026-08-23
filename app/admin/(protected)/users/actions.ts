// app/admin/(protected)/users/actions.ts

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";

const ADMIN_EMAILS = ["admin@echointv.com", "shihaoy74@gmail.com"];

async function verifyAdmin() {
  const session = await getCurrentUser();
  if (!session) {
    throw new Error("未登录");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
  });

  const isEmailAdmin =
    user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase().trim());
  const isAdmin = user?.role === "ADMIN" || isEmailAdmin;

  if (!isAdmin) {
    throw new Error("无管理员权限");
  }

  return user;
}

// 🌟 开通 / 取消 VIP 会员
export async function toggleUserVip(userId: string, currentIsVip: boolean) {
  await verifyAdmin();

  const newIsVip = !currentIsVip;
  const newRole = newIsVip ? "PRO" : "USER";

  // 同时更新 role 为 PRO/USER 以及 isVip 字段
  await prisma.user.update({
    where: { id: userId },
    data: {
      role: newRole,
    },
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin");

  return { success: true, isVip: newIsVip, role: newRole };
}
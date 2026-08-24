// app/admin/(protected)/users/actions.ts

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";

const ADMIN_EMAILS = ["admin@echointv.com", "shihaoy74@gmail.com"];

// 🔒 统一管理员校验
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

// 🌟 1. 开通 / 取消 VIP 会员
export async function toggleUserVip(userId: string, currentIsVip: boolean) {
  await verifyAdmin();

  const newIsVip = !currentIsVip;
  const newRole = newIsVip ? "PRO" : "USER";

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

// 🌟 2. 新增：彻底删除用户账号 Action
export async function deleteUser(userId: string) {
  const admin = await verifyAdmin();

  // 防止管理员误删自己
  if (userId === admin.id) {
    throw new Error("不能删除当前正在登录的管理员账号");
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!targetUser) {
    throw new Error("用户不存在");
  }

  // 保护系统管理员账号不被删除
  if (
    targetUser.role === "ADMIN" ||
    (targetUser.email && ADMIN_EMAILS.includes(targetUser.email.toLowerCase().trim()))
  ) {
    throw new Error("系统管理员账号受保护，无法删除");
  }

  // 事务操作：清理该用户的做题打卡进度、收藏夹数据，最后删除用户本身
  await prisma.$transaction([
    prisma.userProblemProgress.deleteMany({
      where: { userId },
    }),
    prisma.favorite.deleteMany({
      where: { userId },
    }),
    prisma.user.delete({
      where: { id: userId },
    }),
  ]);

  // 刷新后台数据
  revalidatePath("/admin/users");
  revalidatePath("/admin");

  return { success: true };
}
import "server-only";
import { prisma } from "@/lib/prisma";
import { grantProvidesAccess, subscriptionProvidesAccess } from "./status";
export async function hasProAccess(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { billingSubscriptions: { orderBy: { updatedAt: "desc" }, take: 10 }, membershipGrants: { orderBy: { createdAt: "desc" }, take: 10 } } });
  if (!user) return false;
  if (user.role === "ADMIN" || user.isVip) return true;
  if (user.role === "PRO" && (!user.proExpiresAt || user.proExpiresAt > new Date())) return true;
  return user.billingSubscriptions.some((subscription) => subscriptionProvidesAccess(subscription)) ||
    user.membershipGrants.some((grant) => grantProvidesAccess(grant));
}
export async function syncUserProRole(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { billingSubscriptions: true, membershipGrants: true } });
  if (!user || user.role === "ADMIN" || user.isVip) return;
  const active = user.billingSubscriptions.some((subscription) => subscriptionProvidesAccess(subscription)) ||
    user.membershipGrants.some((grant) => grantProvidesAccess(grant));
  await prisma.user.update({ where: { id: userId }, data: { role: active ? "PRO" : "USER", proStartedAt: active ? (user.proStartedAt || new Date()) : null, proExpiresAt: active ? user.proExpiresAt : null } });
}

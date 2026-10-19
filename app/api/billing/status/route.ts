import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/user-auth";
import { hasProAccess } from "@/lib/billing/entitlements";
import { prisma } from "@/lib/prisma";
export async function GET() {
  const user = await getCurrentUser(); if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [active, subscription, payment] = await Promise.all([
    hasProAccess(user.id),
    prisma.billingSubscription.findFirst({ where: { userId: user.id }, orderBy: { updatedAt: "desc" }, select: { provider: true, status: true, currentPeriodEnd: true } }),
    prisma.billingPayment.findFirst({ where: { userId: user.id }, orderBy: { updatedAt: "desc" }, select: { provider: true, status: true, paidAt: true } }),
  ]);
  return NextResponse.json({ active, subscription, payment });
}

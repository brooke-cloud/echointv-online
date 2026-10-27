import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/user-auth";
import { getPayPalPlanId } from "@/lib/billing/plans";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in before checkout." }, { status: 401 });
  const clientId = process.env.PAYPAL_CLIENT_ID;
  if (!clientId) return NextResponse.json({ error: "PayPal is not configured." }, { status: 503 });
  const isLive = process.env.PAYPAL_MODE === "live" || process.env.PAYPAL_API === "https://api-m.paypal.com";
  return NextResponse.json({ clientId, planId: getPayPalPlanId(), userId: user.id, environment: isLive ? "live" : "sandbox" });
}

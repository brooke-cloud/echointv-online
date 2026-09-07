// app/api/auth/google/callback/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setUserSession } from "@/lib/user-auth";
const ADMIN_EMAILS = ["admin@echointv.com", "shihaoy74@gmail.com"];
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const errorParam = searchParams.get("error");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const redirectUri = `${siteUrl}/api/auth/google/callback`;
  console.log("[Google OAuth] Callback received");
  console.log("[Google OAuth] Site URL:", siteUrl);
  console.log("[Google OAuth] Redirect URI:", redirectUri);
  console.log("[Google OAuth] Has code:", !!code);
  console.log("[Google OAuth] Has GOOGLE_CLIENT_ID:", !!process.env.GOOGLE_CLIENT_ID);
  console.log("[Google OAuth] Has GOOGLE_CLIENT_SECRET:", !!process.env.GOOGLE_CLIENT_SECRET);
  if (errorParam) {
    console.error("[Google OAuth] Google authorization returned error:", errorParam);
    return NextResponse.redirect(`${siteUrl}/login?error=${encodeURIComponent(errorParam)}`);
  }
  if (!code) {
    console.error("[Google OAuth] No authorization code received");
    return NextResponse.redirect(`${siteUrl}/login?error=${encodeURIComponent("未接收到授权Code")}`);
  }
  try {
    console.log("[Google OAuth] Step 1: Requesting Google token...");
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID || "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    console.log("[Google OAuth] Google token response status:", tokenRes.status);
    const tokenData = await tokenRes.json();
    console.log("[Google OAuth] Google token response received");
    if (!tokenRes.ok || !tokenData.access_token) {
      console.error("[Google OAuth] Google token exchange failed:", tokenData);
      return NextResponse.redirect(
        `${siteUrl}/login?error=${encodeURIComponent(tokenData.error_description || "Google凭证换取失败")}`
      );
    }
    console.log("[Google OAuth] Step 1 successful: Access token received");
    console.log("[Google OAuth] Step 2: Requesting Google user info...");
    const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });
    console.log("[Google OAuth] Google userinfo response status:", userInfoRes.status);
    const googleUser = await userInfoRes.json();
    console.log("[Google OAuth] Google user info response received");
    if (!userInfoRes.ok) {
      console.error("[Google OAuth] Google userinfo request failed:", googleUser);
      return NextResponse.redirect(
        `${siteUrl}/login?error=${encodeURIComponent(googleUser.error?.message || "Google用户信息获取失败")}`
      );
    }
    const email = googleUser.email?.toLowerCase().trim();
    const name = googleUser.name || googleUser.given_name || (email ? email.split("@")[0] : "Google User");
    if (!email) {
      console.error("[Google OAuth] Google account did not return an email address");
      return NextResponse.redirect(`${siteUrl}/login?error=${encodeURIComponent("未能读取Google邮箱")}`);
    }
    console.log("[Google OAuth] Step 2 successful: Google email:", email);
    console.log("[Google OAuth] Step 3: Looking up user in database...");
    let user = await prisma.user.findUnique({
      where: { email },
    });
    console.log("[Google OAuth] Database lookup completed. User exists:", !!user);
    const isEmailAdmin = ADMIN_EMAILS.includes(email);
    if (!user) {
      console.log("[Google OAuth] User does not exist. Creating new user...");
      user = await prisma.user.create({
        data: {
          email,
          name,
          password: "GOOGLE_OAUTH_ACCOUNT_NO_PASSWORD",
          role: isEmailAdmin ? "ADMIN" : "USER",
        },
      });
      console.log(`[Google OAuth] New user created successfully: ${email}`);
    } else if (isEmailAdmin && user.role !== "ADMIN") {
      console.log("[Google OAuth] Updating existing user role to ADMIN...");
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: "ADMIN" },
      });
      console.log(`[Google OAuth] User role updated successfully: ${email}`);
    }
    console.log("[Google OAuth] Step 4: Creating user session...");
    await setUserSession({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
    console.log(`[Google OAuth] Login successful: ${email}`);
    return NextResponse.redirect(`${siteUrl}/`);
  } catch (err: any) {
    console.error("[Google OAuth] Processing failed");
    console.error("[Google OAuth] Error name:", err?.name);
    console.error("[Google OAuth] Error message:", err?.message);
    console.error("[Google OAuth] Error stack:", err?.stack);
    return NextResponse.redirect(
      `${siteUrl}/login?error=${encodeURIComponent(err?.message || "系统异常")}`
    );
  }
}
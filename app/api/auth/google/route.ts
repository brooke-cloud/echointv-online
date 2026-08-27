// app/api/auth/google/route.ts

import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const redirectUri = `${siteUrl}/api/auth/google/callback`;

  if (!clientId) {
    return NextResponse.json({ error: "Google Client ID 未配置" }, { status: 500 });
  }

  // 构造 Google 官方授权跳转链接
  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleAuthUrl.searchParams.set("client_id", clientId);
  googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
  googleAuthUrl.searchParams.set("response_type", "code");
  googleAuthUrl.searchParams.set("scope", "openid email profile");
  googleAuthUrl.searchParams.set("prompt", "select_account");

  return NextResponse.redirect(googleAuthUrl.toString());
}
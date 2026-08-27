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

  if (errorParam) {
    console.error("Google 授权返回错误:", errorParam);
    return NextResponse.redirect(`${siteUrl}/login?error=${encodeURIComponent(errorParam)}`);
  }

  if (!code) {
    return NextResponse.redirect(`${siteUrl}/login?error=未接收到授权Code`);
  }

  try {
    // 1. 用 code 换取 Google token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID || "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      console.error("Google Token 获取失败详情:", tokenData);
      return NextResponse.redirect(
        `${siteUrl}/login?error=${encodeURIComponent(tokenData.error_description || "Google凭证换取失败")}`
      );
    }

    // 2. 获取 Google 用户资料
    const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const googleUser = await userInfoRes.json();
    const email = googleUser.email?.toLowerCase().trim();
    const name = googleUser.name || googleUser.given_name || email.split("@")[0];

    if (!email) {
      return NextResponse.redirect(`${siteUrl}/login?error=未能读取Google邮箱`);
    }

// 3. 查找或自动注册
    let user = await prisma.user.findUnique({
      where: { email },
    });

    const isEmailAdmin = ADMIN_EMAILS.includes(email);

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          password: "GOOGLE_OAUTH_ACCOUNT_NO_PASSWORD",
          role: isEmailAdmin ? "ADMIN" : "USER",
        },
      });
      console.log(`[Google OAuth] 新用户自动注册成功: ${email}`);
    } else if (isEmailAdmin && user.role !== "ADMIN") {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: "ADMIN" },
      });
    }

    // 🌟 4. 写入会话（传入对象）
    await setUserSession({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    console.log(`[Google OAuth] 用户登录成功: ${email}`);
    return NextResponse.redirect(`${siteUrl}/`);
  } catch (err: any) {
    console.error("Google OAuth 处理异常:", err);
    return NextResponse.redirect(`${siteUrl}/login?error=${encodeURIComponent(err.message || "系统异常")}`);
  }
}
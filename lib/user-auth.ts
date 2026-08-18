import crypto from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "Echo INTV-super-secure-session-secret-key-2026";
const COOKIE_NAME = "Echo INTV_user_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 天有效期

export type UserSessionPayload = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  expiresAt: number;
};

// 密码加密哈希 (加盐)
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .scryptSync(password, salt, 64)
    .toString("hex");
  return `${salt}:${hash}`;
}

// 密码校验
export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, key] = storedHash.split(":");
  if (!salt || !key) return false;
  const hashBuffer = Buffer.from(key, "hex");
  const derivedBuffer = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(hashBuffer, derivedBuffer);
}

// 创建并签名 Session Token
function signToken(payload: UserSessionPayload): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(data)
    .digest("base64url");
  return `${data}.${signature}`;
}

// 验证并解析 Session Token
function verifyToken(token: string): UserSessionPayload | null {
  try {
    const [data, signature] = token.split(".");
    if (!data || !signature) return null;

    const expectedSig = crypto
      .createHmac("sha256", SESSION_SECRET)
      .update(data)
      .digest("base64url");

    if (signature !== expectedSig) return null;

    const payload: UserSessionPayload = JSON.parse(
      Buffer.from(data, "base64url").toString()
    );

    if (Date.now() > payload.expiresAt) {
      return null; // Token 已过期
    }

    return payload;
  } catch {
    return null;
  }
}

// 设置登录 Cookie
export async function setUserSession(user: {
  id: string;
  email: string;
  name: string | null;
  role: string;
}) {
  const expiresAt = Date.now() + SESSION_MAX_AGE * 1000;
  const payload: UserSessionPayload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    expiresAt,
  };

  const token = signToken(payload);
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

// 获取当前登录用户
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload) return null;

    // 从数据库二次验证用户仍然存在
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return user;
  } catch {
    return null;
  }
}

// 清除登录 Cookie
export async function clearUserSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
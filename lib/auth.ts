import {
  createHmac,
  timingSafeEqual,
} from "node:crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_COOKIE_NAME =
  "Echo INTV_admin_session";

const SESSION_DURATION =
  60 * 60 * 24;

// 获取 Session Secret
function getSessionSecret() {
  const secret =
    process.env.SESSION_SECRET;

  if (!secret) {
    throw new Error(
      "SESSION_SECRET is not defined."
    );
  }

  return secret;
}


// 创建 Session 签名
function createSignature(
  expiresAt: number
) {
  return createHmac(
    "sha256",
    getSessionSecret()
  )
    .update(String(expiresAt))
    .digest("hex");
}


// 创建 Session Token
function createSessionToken() {
  const expiresAt =
    Math.floor(Date.now() / 1000) +
    SESSION_DURATION;

  const signature =
    createSignature(expiresAt);

  return `${expiresAt}.${signature}`;
}


// 验证 Session Token
function verifySessionToken(
  token: string
) {
  const [
    expiresValue,
    signature,
  ] = token.split(".");

  if (
    !expiresValue ||
    !signature
  ) {
    return false;
  }

  const expiresAt =
    Number(expiresValue);

  if (
    !Number.isFinite(expiresAt) ||
    expiresAt <
      Math.floor(Date.now() / 1000)
  ) {
    return false;
  }

  const expectedSignature =
    createSignature(expiresAt);

  const receivedBuffer =
    Buffer.from(
      signature,
      "hex"
    );

  const expectedBuffer =
    Buffer.from(
      expectedSignature,
      "hex"
    );

  if (
    receivedBuffer.length !==
    expectedBuffer.length
  ) {
    return false;
  }

  return timingSafeEqual(
    receivedBuffer,
    expectedBuffer
  );
}


// 判断管理员是否登录
export async function isAdminLoggedIn() {
  const cookieStore =
    await cookies();

  const token =
    cookieStore.get(
      ADMIN_COOKIE_NAME
    )?.value;

  if (!token) {
    return false;
  }

  return verifySessionToken(
    token
  );
}


// 创建管理员 Session
export async function createAdminSession() {
  const cookieStore =
    await cookies();

  const token =
    createSessionToken();

  cookieStore.set(
    ADMIN_COOKIE_NAME,
    token,
    {
      httpOnly: true,

      secure:
        process.env.NODE_ENV ===
        "production",

      sameSite: "lax",

      path: "/",

      maxAge:
        SESSION_DURATION,
    }
  );
}


// 删除管理员 Session
export async function deleteAdminSession() {
  const cookieStore =
    await cookies();

  cookieStore.delete(
    ADMIN_COOKIE_NAME
  );
}


// 强制管理员认证
export async function requireAdmin() {
  const loggedIn =
    await isAdminLoggedIn();

  if (!loggedIn) {
    redirect(
      "/admin/login"
    );
  }
}
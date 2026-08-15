"use server";

import { redirect } from "next/navigation";

import {
  createAdminSession,
} from "@/lib/auth";

import {
  verifyPassword,
} from "@/lib/password";

// Admin 登录
export async function loginAdmin(
  formData: FormData
) {
  const email =
    String(
      formData.get("email") ??
      ""
    )
      .trim()
      .toLowerCase();

  const password =
    String(
      formData.get("password") ??
      ""
    );

  if (
    email.length > 200 ||
    password.length > 200
  ) {
    redirect(
      "/admin/login?error=invalid"
    );
  }

  const adminEmail =
    process.env.ADMIN_EMAIL
      ?.trim()
      .toLowerCase();

  const passwordHash =
    process.env.ADMIN_PASSWORD_HASH;

  if (
    !adminEmail ||
    !passwordHash
  ) {
    throw new Error(
      "Admin environment variables are missing."
    );
  }

  const passwordValid =
    verifyPassword(
      password,
      passwordHash
    );

  if (
    email !== adminEmail ||
    !passwordValid
  ) {
    redirect(
      "/admin/login?error=invalid"
    );
  }

  await createAdminSession();

  redirect("/admin");
}
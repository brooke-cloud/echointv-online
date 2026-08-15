"use server";

import { redirect } from "next/navigation";

import {
  deleteAdminSession,
} from "@/lib/auth";

// Admin 退出
export async function logoutAdmin() {
  await deleteAdminSession();

  redirect(
    "/admin/login"
  );
}
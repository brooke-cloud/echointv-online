"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import {
  deleteAdminSession,
} from "@/lib/auth";
import { requireCurrentAdmin } from "@/lib/admin-auth";
import { setPaywallEnabled } from "@/lib/site-settings";

export async function updatePaywallSetting(formData: FormData) {
  await requireCurrentAdmin();

  const enabled = formData.get("enabled") === "true";
  await setPaywallEnabled(enabled);

  revalidatePath("/admin");
  revalidatePath("/problem");
  revalidatePath("/blog");
  revalidatePath("/problem/[slug]", "page");
  revalidatePath("/blog/[slug]", "page");
}

// Admin 退出
export async function logoutAdmin() {
  await deleteAdminSession();

  redirect(
    "/admin/login"
  );
}

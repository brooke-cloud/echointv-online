import { clearUserSession } from "@/lib/user-auth";

export async function POST() {
  await clearUserSession();
  return Response.json({ success: true });
}
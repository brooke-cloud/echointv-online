import { getCurrentUser } from "@/lib/user-auth";
import { redirect } from "next/navigation";

const ADMIN_EMAILS = ["admin@echointv.com", "shihaoy74@gmail.com"];

export async function requireCurrentAdmin() {
  const session = await getCurrentUser();
  if (!session) redirect("/login?redirect=/admin/ai-import");

  const allowed =
    session.role === "ADMIN" ||
    ADMIN_EMAILS.includes(session.email.toLowerCase().trim());

  if (!allowed) redirect("/");
  return session;
}

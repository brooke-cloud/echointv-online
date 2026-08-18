import { getCurrentUser } from "@/lib/user-auth";

export async function GET() {
  const user = await getCurrentUser();
  return Response.json({ user });
}
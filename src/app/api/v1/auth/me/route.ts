import { getCurrentUser } from "@/lib/auth-helpers";
import { ok, fail } from "@/lib/api";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return fail("Not signed in", 401);
  return ok({ user });
}

import { signOut } from "@/auth";
import { ok, handleError } from "@/lib/api";

// POST /api/v1/auth/logout
export async function POST() {
  try {
    await signOut({ redirect: false });
    return ok({ signed_out: true });
  } catch (err) {
    return handleError(err);
  }
}

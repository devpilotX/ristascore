import { NextRequest } from "next/server";
import { signIn } from "@/auth";
import { loginSchema } from "@/lib/schemas";
import { ok, fail, handleError } from "@/lib/api";
import { rateLimit, clientIp } from "@/lib/rate-limit";

// POST /api/v1/auth/login
// Validates credentials and sets the session cookie via Auth.js.
export async function POST(req: NextRequest) {
  try {
    const ip = clientIp(req.headers);
    const rl = rateLimit(`login:${ip}`, 10, 60_000);
    if (!rl.ok) return fail("Too many attempts. Please wait a minute.", 429);

    const body = await req.json();
    const input = loginSchema.parse(body);

    await signIn("credentials", { ...input, redirect: false });
    return ok({ signed_in: true });
  } catch (err) {
    // Auth.js throws a CredentialsSignin error for bad logins.
    if (err && typeof err === "object" && "type" in err) {
      return fail("Invalid email or password", 401);
    }
    return handleError(err);
  }
}

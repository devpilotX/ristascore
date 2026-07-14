import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/schemas";
import { ok, fail, handleError } from "@/lib/api";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = clientIp(req.headers);
    const rl = rateLimit(`register:${ip}`, 10, 60_000);
    if (!rl.ok) return fail("Too many attempts. Please wait a minute.", 429);

    const body = await req.json();
    const input = registerSchema.parse(body);

    const existing = await db.user.findUnique({ where: { email: input.email } });
    if (existing) return fail("An account with this email already exists", 409);

    const hashed = await bcrypt.hash(input.password, 10);
    const user = await db.user.create({
      data: {
        email: input.email,
        full_name: input.full_name,
        phone: input.phone || null,
        hashed_password: hashed,
      },
      select: { id: true, email: true, full_name: true, role: true },
    });

    return ok({ user }, 201);
  } catch (err) {
    return handleError(err);
  }
}

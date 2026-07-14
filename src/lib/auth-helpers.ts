/**
 * Auth helpers used by API routes and server components.
 */

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { hashApiKey } from "@/lib/tokens";

export interface SessionUser {
  id: string;
  email?: string | null;
  name?: string | null;
  role: string;
}

/** Returns the signed in user or null. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role,
  };
}

/** Throws when there is no signed in user. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new AuthError("Not signed in", 401);
  return user;
}

/** Throws when the signed in user is not an admin. */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "admin") throw new AuthError("Admin access required", 403);
  return user;
}

/** Resolve an API key from the X-API-Key header to its owner. */
export async function resolveApiKey(headerValue: string | null) {
  if (!headerValue) return null;
  const key = await db.apiKey.findUnique({
    where: { key_hash: hashApiKey(headerValue) },
  });
  if (!key || !key.is_active) return null;
  return key;
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}

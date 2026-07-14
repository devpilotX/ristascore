import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-helpers";
import { ok, fail, handleError } from "@/lib/api";
import { logger } from "@/lib/logger";

// POST /api/v1/admin/erase  { user_id }
// DPDP Act 2023 data erase. Deactivates badges, then deletes the user.
// Cascades remove consents, verifications, check results, scores, badges,
// audit logs, api keys, and disputes via the schema relations.
export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = (await req.json()) as { user_id?: string };
    if (!body.user_id) return fail("user_id is required", 400);
    if (body.user_id === admin.id) return fail("You cannot erase your own admin account here", 400);

    const user = await db.user.findUnique({ where: { id: body.user_id } });
    if (!user) return fail("User not found", 404);

    await db.user.delete({ where: { id: body.user_id } });
    logger.info({ erased_user: body.user_id, by: admin.id }, "User data erased (DPDP)");

    return ok({ erased: true, user_id: body.user_id });
  } catch (err) {
    return handleError(err);
  }
}

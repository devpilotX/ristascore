import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth-helpers";
import { ok, fail, handleError } from "@/lib/api";

// DELETE /api/v1/api-keys/{id}
// Soft deactivates the key so it can no longer be used.
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const key = await db.apiKey.findUnique({ where: { id: params.id } });
    if (!key || key.owner_id !== user.id) return fail("API key not found", 404);

    await db.apiKey.update({ where: { id: key.id }, data: { is_active: false } });
    return ok({ id: key.id, is_active: false });
  } catch (err) {
    return handleError(err);
  }
}

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { disputeResolveSchema } from "@/lib/schemas";
import { requireAdmin } from "@/lib/auth-helpers";
import { ok, fail, handleError } from "@/lib/api";

// POST /api/v1/disputes/{id}/resolve  (admin only)
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const body = await req.json();
    const input = disputeResolveSchema.parse(body);

    const dispute = await db.dispute.findUnique({ where: { id: params.id } });
    if (!dispute) return fail("Dispute not found", 404);

    const updated = await db.dispute.update({
      where: { id: params.id },
      data: { status: input.status, resolution: input.resolution },
    });
    return ok({ dispute: updated });
  } catch (err) {
    return handleError(err);
  }
}

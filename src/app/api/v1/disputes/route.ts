import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { disputeSchema } from "@/lib/schemas";
import { requireUser } from "@/lib/auth-helpers";
import { ok, fail, handleError } from "@/lib/api";

// POST /api/v1/disputes
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const input = disputeSchema.parse(body);

    const checkResult = await db.checkResult.findUnique({
      where: { id: input.check_result_id },
      include: { request: { select: { subject_id: true } } },
    });
    if (!checkResult || checkResult.request.subject_id !== user.id) {
      return fail("Check result not found", 404);
    }

    const dispute = await db.dispute.create({
      data: {
        subject_id: user.id,
        check_result_id: input.check_result_id,
        reason: input.reason,
      },
    });
    return ok({ dispute }, 201);
  } catch (err) {
    return handleError(err);
  }
}

// GET /api/v1/disputes
// Admins see all disputes, subjects see their own.
export async function GET() {
  try {
    const user = await requireUser();
    const where = user.role === "admin" ? {} : { subject_id: user.id };
    const disputes = await db.dispute.findMany({
      where,
      orderBy: { created_at: "desc" },
    });
    return ok({ disputes });
  } catch (err) {
    return handleError(err);
  }
}

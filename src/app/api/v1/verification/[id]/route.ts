import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth-helpers";
import { ok, fail, handleError } from "@/lib/api";

// GET /api/v1/verification/{id}
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const request = await db.verificationRequest.findUnique({
      where: { id: params.id },
      include: { trust_score: true, badge: true, check_results: true },
    });
    if (!request || request.subject_id !== user.id) {
      return fail("Verification not found", 404);
    }
    return ok({ request });
  } catch (err) {
    return handleError(err);
  }
}

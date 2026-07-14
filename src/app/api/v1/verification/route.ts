import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { verificationSchema } from "@/lib/schemas";
import { requireUser } from "@/lib/auth-helpers";
import { ok, fail, handleError } from "@/lib/api";
import { enqueueVerification } from "@/lib/queue";

// POST /api/v1/verification
// Creates a request for an active consent, runs the authorized checks,
// scores the result, and issues a badge.
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const input = verificationSchema.parse(body);

    const consent = await db.consent.findUnique({ where: { id: input.consent_id } });
    if (!consent || consent.user_id !== user.id) {
      return fail("Consent not found", 404);
    }
    if (!consent.is_active) {
      return fail("This consent has been revoked. Grant consent again to verify.", 409);
    }

    const request = await db.verificationRequest.create({
      data: {
        subject_id: user.id,
        consent_id: consent.id,
        claimed_data: input.claimed_data,
        status: "pending",
      },
    });

    const { mode } = await enqueueVerification(request.id);

    // In sync mode the badge is ready now; load the full result.
    const full = await db.verificationRequest.findUnique({
      where: { id: request.id },
      include: { trust_score: true, badge: true, check_results: true },
    });

    return ok({ request: full, mode }, 201);
  } catch (err) {
    return handleError(err);
  }
}

// GET /api/v1/verification
export async function GET() {
  try {
    const user = await requireUser();
    const requests = await db.verificationRequest.findMany({
      where: { subject_id: user.id },
      orderBy: { created_at: "desc" },
      include: { trust_score: true, badge: true },
    });
    return ok({ requests });
  } catch (err) {
    return handleError(err);
  }
}

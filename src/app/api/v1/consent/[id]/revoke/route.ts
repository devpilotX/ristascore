import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth-helpers";
import { ok, fail, handleError } from "@/lib/api";
import { logger } from "@/lib/logger";

// POST /api/v1/consent/{id}/revoke
// Revoking consent immediately deactivates every badge linked to it.
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();

    const consent = await db.consent.findUnique({
      where: { id: params.id },
      include: { verifications: { select: { id: true } } },
    });

    if (!consent || consent.user_id !== user.id) {
      return fail("Consent not found", 404);
    }
    if (!consent.is_active) {
      return ok({ consent, message: "Consent was already revoked" });
    }

    const requestIds = consent.verifications.map((v) => v.id);

    const [updatedConsent] = await db.$transaction([
      db.consent.update({
        where: { id: consent.id },
        data: { is_active: false, revoked_at: new Date() },
      }),
      db.trustBadge.updateMany({
        where: { request_id: { in: requestIds } },
        data: { is_active: false },
      }),
    ]);

    logger.info({ consentId: consent.id, badges: requestIds.length }, "Consent revoked");
    return ok({ consent: updatedConsent, deactivated_badges: requestIds.length });
  } catch (err) {
    return handleError(err);
  }
}

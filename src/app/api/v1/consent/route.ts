import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { consentSchema } from "@/lib/schemas";
import { requireUser } from "@/lib/auth-helpers";
import { ok, handleError } from "@/lib/api";
import { clientIp } from "@/lib/rate-limit";

const CONSENT_TEXT =
  "I explicitly and voluntarily consent to the selected background checks for the " +
  "purpose of generating a marriage trust badge. I understand this is purpose bound " +
  "and revocable at any time.";

// POST /api/v1/consent
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const input = consentSchema.parse(body);

    const consent = await db.consent.create({
      data: {
        user_id: user.id,
        authorized_checks: input.authorized_checks,
        consent_text: CONSENT_TEXT,
        ip_address: clientIp(req.headers),
        user_agent: req.headers.get("user-agent") || null,
      },
    });

    return ok({ consent }, 201);
  } catch (err) {
    return handleError(err);
  }
}

// GET /api/v1/consent
export async function GET() {
  try {
    const user = await requireUser();
    const consents = await db.consent.findMany({
      where: { user_id: user.id },
      orderBy: { consented_at: "desc" },
    });
    return ok({ consents });
  } catch (err) {
    return handleError(err);
  }
}

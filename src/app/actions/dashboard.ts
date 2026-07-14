"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth-helpers";
import { CHECK_TYPES, CheckType, isCheckType } from "@/lib/checks";
import { enqueueVerification } from "@/lib/queue";
import { clientIp } from "@/lib/rate-limit";

const CONSENT_TEXT =
  "I explicitly and voluntarily consent to the selected background checks for the " +
  "purpose of generating a marriage trust badge. I understand this is purpose bound " +
  "and revocable at any time.";

export interface DashState {
  error?: string;
  ok?: string;
}

/**
 * Records consent, runs a verification with the claimed details from the form,
 * and issues a badge. One smooth action for the dashboard.
 */
export async function runVerificationAction(
  _prev: DashState,
  formData: FormData,
): Promise<DashState> {
  const user = await requireUser();

  if (formData.get("i_agree") !== "on") {
    return { error: "Please tick the consent box to continue" };
  }

  const checks = CHECK_TYPES.filter((c) => formData.get(`check_${c}`) === "on");
  if (checks.length === 0) {
    return { error: "Choose at least one check to authorise" };
  }

  const h = headers();
  const consent = await db.consent.create({
    data: {
      user_id: user.id,
      authorized_checks: checks,
      consent_text: CONSENT_TEXT,
      ip_address: clientIp(h as unknown as Headers),
      user_agent: h.get("user-agent") || null,
    },
  });

  // Build claimed_data from the optional detail fields.
  const claimed: Record<string, string> = {};
  for (const key of [
    "full_name",
    "id_number",
    "employer_name",
    "monthly_income",
    "highest_qualification",
    "institution",
    "marital_status",
    "city",
  ]) {
    const v = formData.get(key);
    if (typeof v === "string" && v.trim()) claimed[key] = v.trim();
  }
  if (!claimed.full_name && user.name) claimed.full_name = user.name;

  const request = await db.verificationRequest.create({
    data: {
      subject_id: user.id,
      consent_id: consent.id,
      claimed_data: claimed,
      status: "pending",
    },
  });

  await enqueueVerification(request.id);
  revalidatePath("/dashboard");
  return { ok: "Verification complete. Your new badge is ready below." };
}

export async function revokeConsentAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const consentId = String(formData.get("consent_id") || "");
  if (!consentId) return;

  const consent = await db.consent.findUnique({
    where: { id: consentId },
    include: { verifications: { select: { id: true } } },
  });
  if (!consent || consent.user_id !== user.id || !consent.is_active) return;

  const requestIds = consent.verifications.map((v) => v.id);
  await db.$transaction([
    db.consent.update({
      where: { id: consentId },
      data: { is_active: false, revoked_at: new Date() },
    }),
    db.trustBadge.updateMany({
      where: { request_id: { in: requestIds } },
      data: { is_active: false },
    }),
  ]);
  revalidatePath("/dashboard");
}

export type { CheckType };
export { isCheckType };

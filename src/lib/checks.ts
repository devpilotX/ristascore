/**
 * Core domain constants for RishtaScore.
 *
 * These mirror the Prisma enums but live here as plain values so the
 * scoring engine and providers can be tested without a database.
 */

export const CHECK_TYPES = [
  "government_id",
  "employment_income",
  "education",
  "marital_status",
  "criminal_record",
] as const;

export type CheckType = (typeof CHECK_TYPES)[number];

export const CHECK_STATUSES = ["verified", "mismatch", "unverifiable", "pending"] as const;

export type CheckStatus = (typeof CHECK_STATUSES)[number];

/** Friendly labels for the UI. No em dashes anywhere. */
export const CHECK_LABELS: Record<CheckType, string> = {
  government_id: "Government ID",
  employment_income: "Employment and Income",
  education: "Education",
  marital_status: "Marital Status",
  criminal_record: "Criminal Record",
};

/** Maximum points each check can earn. Five checks times 180 equals 900. */
export const MAX_PER_CHECK = 180;

/** Total maximum trust score. */
export const MAX_TOTAL = MAX_PER_CHECK * CHECK_TYPES.length;

/**
 * Marital status is confirmed by a notarised affidavit plus eCourts lookup.
 * That is best effort, never absolute, so we cap its confidence below the max.
 */
export const MARITAL_STATUS_CAP = 153;

export function isCheckType(value: string): value is CheckType {
  return (CHECK_TYPES as readonly string[]).includes(value);
}

/**
 * Verification provider interface.
 *
 * Every check (Government ID, Employment, Education, Marital Status,
 * Criminal Record) is handled by a provider that implements this interface.
 *
 * Ship realistic mocks now, swap in real integrations later without touching
 * the scoring engine or the API. Each provider declares its required fields
 * and its max score, runs the check, and returns a normalised result.
 */

import { CheckStatus, CheckType } from "../checks";

export interface VerificationResult {
  status: CheckStatus;
  score_contribution: number;
  summary: string;
  provider_name: string;
  /**
   * How this result was produced:
   *  - "sandbox": simulated, NOT backed by a live source. Must be labelled as such.
   *  - "live": produced by a real, credentialed provider integration.
   */
  mode: "sandbox" | "live";
  /** Raw provider payload. Never contains raw government ID numbers. */
  raw_response: Record<string, unknown>;
}

export interface VerificationProvider {
  readonly check_type: CheckType;
  readonly provider_name: string;
  readonly required_fields: string[];
  readonly max_score: number;
  verify(claimedData: Record<string, unknown>): Promise<VerificationResult>;
}

/** Keep only the last 4 characters of a sensitive value. */
export function maskLast4(value: unknown): string {
  const str = String(value ?? "").replace(/\s+/g, "");
  if (str.length <= 4) return "****";
  return `xxxx-${str.slice(-4)}`;
}

/** Check that every required field is present and non empty. */
export function hasRequiredFields(
  data: Record<string, unknown>,
  fields: string[],
): boolean {
  return fields.every((f) => {
    const v = data[f];
    return v !== undefined && v !== null && String(v).trim().length > 0;
  });
}

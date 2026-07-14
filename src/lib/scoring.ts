/**
 * RishtaScore scoring engine.
 *
 * Pure, side effect free, and fully unit tested. No database, no network.
 *
 * Rules, enforced here so the badge can be trusted:
 *  - Five categories, each worth up to 180 points, for a total of 900.
 *  - Only a "verified" result earns points. "unverifiable", "mismatch",
 *    and "pending" earn zero, so junk can never out score honest data.
 *  - Every category is clamped to [0, 180] and the total to [0, 900].
 *  - Missing checks are not penalised. They simply do not add points.
 *  - We track "unverifiable" results separately as a coverage metric.
 */

import {
  CHECK_LABELS,
  CheckStatus,
  CheckType,
  MARITAL_STATUS_CAP,
  MAX_PER_CHECK,
  MAX_TOTAL,
} from "./checks";

export type Grade = "A+" | "A" | "B+" | "B" | "C" | "D";

export interface CheckOutcome {
  check_type: CheckType;
  status: CheckStatus;
  /** Raw points the provider proposes. Defaults to MAX_PER_CHECK for a verified check. */
  score_contribution?: number;
}

export interface CategoryBreakdown {
  check_type: CheckType;
  label: string;
  status: CheckStatus;
  score: number;
  max_score: number;
}

export interface CoverageMetric {
  /** How many checks were attempted. */
  attempted: number;
  /** How many came back verified. */
  verified: number;
  /** How many came back unverifiable. */
  unverifiable: number;
  /** How many came back as a mismatch. */
  mismatch: number;
  /** How many are still pending. */
  pending: number;
}

export interface TrustScoreResult {
  total_score: number;
  max_score: number;
  grade: Grade;
  breakdown: CategoryBreakdown[];
  coverage: CoverageMetric;
}

/** Clamp a number into an inclusive range. */
export function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.max(min, Math.min(max, value));
}

/**
 * Points earned by a single check.
 * Only verified checks earn points. Everything else earns zero.
 * Marital status is capped to mirror affidavit confidence.
 */
export function scoreForCheck(outcome: CheckOutcome): number {
  if (outcome.status !== "verified") return 0;

  const proposed =
    typeof outcome.score_contribution === "number"
      ? outcome.score_contribution
      : MAX_PER_CHECK;

  const cap = outcome.check_type === "marital_status" ? MARITAL_STATUS_CAP : MAX_PER_CHECK;

  return clamp(Math.round(proposed), 0, cap);
}

/** Map a 0 to 900 score to a letter grade. High to low. */
export function gradeForScore(score: number): Grade {
  if (score >= 750) return "A+";
  if (score >= 650) return "A";
  if (score >= 550) return "B+";
  if (score >= 450) return "B";
  if (score >= 350) return "C";
  return "D";
}

/**
 * Compute the full trust score from a set of check outcomes.
 * Duplicate check types are ignored after the first to keep the badge honest;
 * the first outcome for each type wins.
 */
export function computeTrustScore(outcomes: CheckOutcome[]): TrustScoreResult {
  const seen = new Set<CheckType>();
  const breakdown: CategoryBreakdown[] = [];
  const coverage: CoverageMetric = {
    attempted: 0,
    verified: 0,
    unverifiable: 0,
    mismatch: 0,
    pending: 0,
  };

  let total = 0;

  for (const outcome of outcomes) {
    if (seen.has(outcome.check_type)) continue;
    seen.add(outcome.check_type);

    const score = scoreForCheck(outcome);
    total += score;

    coverage.attempted += 1;
    if (outcome.status === "verified") coverage.verified += 1;
    else if (outcome.status === "unverifiable") coverage.unverifiable += 1;
    else if (outcome.status === "mismatch") coverage.mismatch += 1;
    else if (outcome.status === "pending") coverage.pending += 1;

    breakdown.push({
      check_type: outcome.check_type,
      label: CHECK_LABELS[outcome.check_type],
      status: outcome.status,
      score,
      max_score: MAX_PER_CHECK,
    });
  }

  const total_score = clamp(total, 0, MAX_TOTAL);

  return {
    total_score,
    max_score: MAX_TOTAL,
    grade: gradeForScore(total_score),
    breakdown,
    coverage,
  };
}

import { describe, expect, it } from "vitest";
import {
  clamp,
  computeTrustScore,
  gradeForScore,
  scoreForCheck,
} from "./scoring";
import { MARITAL_STATUS_CAP, MAX_PER_CHECK, MAX_TOTAL } from "./checks";

describe("clamp", () => {
  it("keeps values inside the range", () => {
    expect(clamp(50, 0, 180)).toBe(50);
  });
  it("clamps below the minimum", () => {
    expect(clamp(-10, 0, 180)).toBe(0);
  });
  it("clamps above the maximum", () => {
    expect(clamp(500, 0, 180)).toBe(180);
  });
  it("treats NaN as the minimum", () => {
    expect(clamp(Number.NaN, 0, 180)).toBe(0);
  });
});

describe("gradeForScore", () => {
  it("maps boundaries correctly", () => {
    expect(gradeForScore(900)).toBe("A+");
    expect(gradeForScore(750)).toBe("A+");
    expect(gradeForScore(749)).toBe("A");
    expect(gradeForScore(650)).toBe("A");
    expect(gradeForScore(649)).toBe("B+");
    expect(gradeForScore(550)).toBe("B+");
    expect(gradeForScore(549)).toBe("B");
    expect(gradeForScore(450)).toBe("B");
    expect(gradeForScore(449)).toBe("C");
    expect(gradeForScore(350)).toBe("C");
    expect(gradeForScore(349)).toBe("D");
    expect(gradeForScore(0)).toBe("D");
  });
});

describe("scoreForCheck", () => {
  it("gives full points to a verified check", () => {
    expect(scoreForCheck({ check_type: "government_id", status: "verified" })).toBe(
      MAX_PER_CHECK,
    );
  });

  it("gives zero to unverifiable, mismatch, and pending", () => {
    expect(scoreForCheck({ check_type: "education", status: "unverifiable" })).toBe(0);
    expect(scoreForCheck({ check_type: "education", status: "mismatch" })).toBe(0);
    expect(scoreForCheck({ check_type: "education", status: "pending" })).toBe(0);
  });

  it("caps marital status at the affidavit confidence cap", () => {
    expect(
      scoreForCheck({
        check_type: "marital_status",
        status: "verified",
        score_contribution: 180,
      }),
    ).toBe(MARITAL_STATUS_CAP);
  });

  it("clamps a proposed contribution into range", () => {
    expect(
      scoreForCheck({
        check_type: "education",
        status: "verified",
        score_contribution: 9999,
      }),
    ).toBe(MAX_PER_CHECK);
    expect(
      scoreForCheck({
        check_type: "education",
        status: "verified",
        score_contribution: -50,
      }),
    ).toBe(0);
  });
});

describe("computeTrustScore", () => {
  it("scores a perfect run, with marital status capped", () => {
    const result = computeTrustScore([
      { check_type: "government_id", status: "verified" },
      { check_type: "employment_income", status: "verified" },
      { check_type: "education", status: "verified" },
      { check_type: "marital_status", status: "verified" },
      { check_type: "criminal_record", status: "verified" },
    ]);
    // 180 * 4 + 153 = 873
    expect(result.total_score).toBe(873);
    expect(result.grade).toBe("A+");
    expect(result.max_score).toBe(MAX_TOTAL);
    expect(result.coverage.verified).toBe(5);
  });

  it("junk can never out score honest verified data", () => {
    const honest = computeTrustScore([
      { check_type: "government_id", status: "verified" },
    ]);
    const junk = computeTrustScore([
      { check_type: "government_id", status: "mismatch", score_contribution: 9999 },
      { check_type: "education", status: "unverifiable", score_contribution: 9999 },
    ]);
    expect(junk.total_score).toBe(0);
    expect(honest.total_score).toBeGreaterThan(junk.total_score);
  });

  it("does not penalise missing checks", () => {
    const result = computeTrustScore([
      { check_type: "government_id", status: "verified" },
      { check_type: "education", status: "verified" },
    ]);
    expect(result.total_score).toBe(360);
    expect(result.coverage.attempted).toBe(2);
  });

  it("tracks coverage for each status", () => {
    const result = computeTrustScore([
      { check_type: "government_id", status: "verified" },
      { check_type: "employment_income", status: "unverifiable" },
      { check_type: "education", status: "mismatch" },
      { check_type: "marital_status", status: "pending" },
    ]);
    expect(result.coverage).toMatchObject({
      attempted: 4,
      verified: 1,
      unverifiable: 1,
      mismatch: 1,
      pending: 1,
    });
  });

  it("ignores duplicate check types, first one wins", () => {
    const result = computeTrustScore([
      { check_type: "government_id", status: "verified" },
      { check_type: "government_id", status: "mismatch" },
    ]);
    expect(result.breakdown).toHaveLength(1);
    expect(result.total_score).toBe(MAX_PER_CHECK);
  });

  it("never exceeds the total maximum", () => {
    const result = computeTrustScore([
      { check_type: "government_id", status: "verified", score_contribution: 9999 },
      { check_type: "employment_income", status: "verified", score_contribution: 9999 },
      { check_type: "education", status: "verified", score_contribution: 9999 },
      { check_type: "marital_status", status: "verified", score_contribution: 9999 },
      { check_type: "criminal_record", status: "verified", score_contribution: 9999 },
    ]);
    expect(result.total_score).toBeLessThanOrEqual(MAX_TOTAL);
  });
});

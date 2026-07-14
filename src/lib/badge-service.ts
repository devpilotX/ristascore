/**
 * Badge service. Shared logic for the public and B2B badge endpoints.
 *
 * Honest labelling: only verified checks show points. Revoked or expired
 * badges return a "gone" signal so callers can answer 410.
 */

import { db } from "./db";
import { CHECK_LABELS, CheckType } from "./checks";

export interface PublicBadgeView {
  token: string;
  subject_name: string;
  total_score: number;
  max_score: number;
  grade: string;
  issued_at: Date;
  expires_at: Date;
  breakdown: Array<{
    check_type: CheckType;
    label: string;
    status: string;
    score: number;
    max_score: number;
  }>;
}

export type BadgeLookup =
  | { state: "ok"; badgeId: string; view: PublicBadgeView }
  | { state: "gone"; reason: string }
  | { state: "not_found" };

export async function lookupBadge(token: string): Promise<BadgeLookup> {
  const badge = await db.trustBadge.findUnique({
    where: { token },
    include: {
      request: {
        include: {
          subject: { select: { full_name: true } },
          trust_score: true,
        },
      },
    },
  });

  if (!badge) return { state: "not_found" };
  if (!badge.is_active) return { state: "gone", reason: "This badge has been revoked." };
  if (badge.expires_at.getTime() < Date.now()) {
    return { state: "gone", reason: "This badge has expired." };
  }

  const score = badge.request.trust_score;
  if (!score) return { state: "gone", reason: "This badge has no score yet." };

  // Only show the checks the subject chose to make visible.
  const visible = new Set(badge.visible_fields as CheckType[]);
  const rawBreakdown = (score.breakdown as Array<Record<string, unknown>>) ?? [];
  const breakdown = rawBreakdown
    .filter((b) => visible.has(b.check_type as CheckType))
    .map((b) => ({
      check_type: b.check_type as CheckType,
      label: CHECK_LABELS[b.check_type as CheckType],
      status: String(b.status),
      score: Number(b.score),
      max_score: Number(b.max_score),
    }));

  return {
    state: "ok",
    badgeId: badge.id,
    view: {
      token: badge.token,
      subject_name: badge.request.subject.full_name,
      total_score: score.total_score,
      max_score: score.max_score,
      grade: score.grade,
      issued_at: badge.issued_at,
      expires_at: badge.expires_at,
      breakdown,
    },
  };
}

/** Write an audit log row for a badge view. Never throws. */
export async function logBadgeView(
  badgeId: string,
  opts: { ip?: string; userAgent?: string | null; apiKeyId?: string | null },
): Promise<void> {
  try {
    await db.badgeAuditLog.create({
      data: {
        badge_id: badgeId,
        viewer_ip: opts.ip ?? null,
        viewer_user_agent: opts.userAgent ?? null,
        api_key_id: opts.apiKeyId ?? null,
      },
    });
  } catch {
    // Audit logging must never break a read.
  }
}

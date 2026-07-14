/**
 * Verification runner.
 *
 * Given a verification request, this runs only the checks the user consented
 * to, stores each check result, computes the trust score with the pure engine,
 * and issues a portable badge.
 *
 * This is the heart of the core loop and is provider agnostic. It can be
 * called synchronously (dev) or from a BullMQ worker (prod).
 */

import { CheckType, Prisma } from "@prisma/client";
import { db } from "./db";
import { env } from "./env";
import { logger } from "./logger";
import { getProvider } from "./providers";
import { computeTrustScore, CheckOutcome } from "./scoring";
import { generateBadgeToken } from "./tokens";

const BADGE_TTL_DAYS = 180;

export async function runVerification(requestId: string): Promise<void> {
  const request = await db.verificationRequest.findUnique({
    where: { id: requestId },
    include: { consent: true },
  });

  if (!request) throw new Error(`Verification request not found: ${requestId}`);

  // Consent gate. Never run a check without active consent.
  if (!request.consent.is_active) {
    await db.verificationRequest.update({
      where: { id: requestId },
      data: { status: "failed", completed_at: new Date() },
    });
    throw new Error("Consent is not active. Verification refused.");
  }

  await db.verificationRequest.update({
    where: { id: requestId },
    data: { status: "running", verification_mode: env.verificationMode },
  });

  const claimed = (request.claimed_data as Record<string, unknown>) || {};
  const authorized = request.consent.authorized_checks as CheckType[];

  const outcomes: CheckOutcome[] = [];

  for (const checkType of authorized) {
    const provider = getProvider(checkType);
    let result;
    try {
      result = await provider.verify(claimed);
    } catch (err) {
      logger.error({ checkType }, "Provider threw, marking unverifiable");
      result = {
        status: "unverifiable" as const,
        score_contribution: 0,
        summary: "Provider error. Could not complete this check.",
        provider_name: provider.provider_name,
        mode: env.verificationMode,
        raw_response: { error: true },
      };
    }

    await db.checkResult.create({
      data: {
        request_id: requestId,
        check_type: checkType,
        status: result.status,
        provider_name: result.provider_name,
        provider_response: result.raw_response as Prisma.InputJsonValue,
        summary: result.summary,
        score_contribution: result.score_contribution,
      },
    });

    outcomes.push({
      check_type: checkType,
      status: result.status,
      score_contribution: result.score_contribution,
    });
  }

  const score = computeTrustScore(outcomes);

  await db.trustScore.create({
    data: {
      request_id: requestId,
      total_score: score.total_score,
      max_score: score.max_score,
      grade: score.grade,
      breakdown: score.breakdown as unknown as Prisma.InputJsonValue,
      coverage: score.coverage as unknown as Prisma.InputJsonValue,
    },
  });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + BADGE_TTL_DAYS);

  await db.trustBadge.create({
    data: {
      request_id: requestId,
      token: generateBadgeToken(),
      visible_fields: authorized,
      expires_at: expiresAt,
    },
  });

  await db.verificationRequest.update({
    where: { id: requestId },
    data: { status: "completed", completed_at: new Date() },
  });

  logger.info({ requestId, grade: score.grade }, "Verification completed");
}

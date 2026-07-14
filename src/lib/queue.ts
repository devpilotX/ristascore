/**
 * Verification queue.
 *
 * If REDIS_URL is set, jobs go through a BullMQ queue and are processed by the
 * worker (see worker/index.ts). If Redis is absent, we run the verification
 * synchronously in the same process, which is perfect for local development.
 *
 * bullmq and ioredis are optional dependencies, so we import them lazily and
 * only when Redis is configured.
 */

import { hasRedis, env } from "./env";
import { logger } from "./logger";
import { runVerification } from "./verification-runner";

export const VERIFICATION_QUEUE = "verification";

// Cache the queue instance across calls.
let queuePromise: Promise<unknown> | null = null;

async function getQueue() {
  if (!queuePromise) {
    queuePromise = (async () => {
      const { Queue } = await import("bullmq");
      const IORedis = (await import("ioredis")).default;
      const connection = new IORedis(env.redisUrl, { maxRetriesPerRequest: null });
      return new Queue(VERIFICATION_QUEUE, { connection: connection as never });
    })();
  }
  return queuePromise;
}

/**
 * Enqueue a verification run. Returns whether it was queued (async) or run
 * inline (sync fallback).
 */
export async function enqueueVerification(requestId: string): Promise<{ mode: "queued" | "sync" }> {
  if (hasRedis) {
    try {
      const queue = (await getQueue()) as { add: (n: string, d: unknown) => Promise<unknown> };
      await queue.add("run", { requestId });
      return { mode: "queued" };
    } catch (err) {
      logger.error({ err: String(err) }, "Queue add failed, running inline instead");
    }
  }

  // Synchronous fallback.
  await runVerification(requestId);
  return { mode: "sync" };
}

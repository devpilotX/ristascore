/**
 * Background worker.
 *
 * Run with: npm run worker
 * Processes queued verification jobs. Only needed when REDIS_URL is set.
 */

import { Worker } from "bullmq";
import IORedis from "ioredis";
import { env, hasRedis } from "../src/lib/env";
import { logger } from "../src/lib/logger";
import { runVerification } from "../src/lib/verification-runner";
import { VERIFICATION_QUEUE } from "../src/lib/queue";

async function main() {
  if (!hasRedis) {
    logger.warn("REDIS_URL is not set. The worker has nothing to do. Exiting.");
    process.exit(0);
  }

  const connection = new IORedis(env.redisUrl, { maxRetriesPerRequest: null });

  const worker = new Worker(
    VERIFICATION_QUEUE,
    async (job) => {
      const { requestId } = job.data as { requestId: string };
      logger.info({ requestId }, "Worker picked up verification job");
      await runVerification(requestId);
    },
    { connection: connection as never },
  );

  worker.on("completed", (job) => logger.info({ jobId: job.id }, "Job completed"));
  worker.on("failed", (job, err) =>
    logger.error({ jobId: job?.id, err: String(err) }, "Job failed"),
  );

  logger.info("Verification worker started");
}

main().catch((err) => {
  logger.error({ err: String(err) }, "Worker crashed");
  process.exit(1);
});

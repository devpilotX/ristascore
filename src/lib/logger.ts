/**
 * Logger.
 *
 * Uses pino. Redacts common PII and secret fields so they never reach logs,
 * in line with privacy by design.
 */

import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  redact: {
    paths: [
      "password",
      "hashed_password",
      "id_number",
      "email",
      "phone",
      "*.password",
      "*.id_number",
      "*.email",
      "*.phone",
      "req.headers.authorization",
      "req.headers.cookie",
      "headers.authorization",
      "headers.cookie",
    ],
    censor: "[redacted]",
  },
});

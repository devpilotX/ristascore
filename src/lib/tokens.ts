/**
 * Token helpers. Badge tokens are public, unguessable, and prefixed rs_.
 * API keys are shown once, then only their SHA-256 hash is stored.
 */

import { createHash, randomBytes } from "node:crypto";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789";

function randomString(length: number): string {
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += ALPHABET[bytes[i]! % ALPHABET.length];
  }
  return out;
}

/** Public badge token, for example rs_7Qm3kP9xR2tLdW8sFhA1bN4c. */
export function generateBadgeToken(): string {
  return `rs_${randomString(24)}`;
}

/** A new API key. The plaintext is returned once; store only its hash. */
export function generateApiKey(): { plaintext: string; hash: string } {
  const plaintext = `rsk_${randomString(36)}`;
  return { plaintext, hash: hashApiKey(plaintext) };
}

export function hashApiKey(plaintext: string): string {
  return createHash("sha256").update(plaintext).digest("hex");
}

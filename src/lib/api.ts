/**
 * Small helpers for API route handlers: consistent JSON shapes, Zod error
 * formatting, and turning thrown AuthErrors into the right status code.
 */

import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AuthError } from "./auth-helpers";
import { logger } from "./logger";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ ok: true, data }, { status });
}

export function fail(message: string, status = 400, extra?: unknown) {
  return NextResponse.json({ ok: false, error: message, details: extra }, { status });
}

/** Wrap any thrown error into a clean response. */
export function handleError(err: unknown) {
  if (err instanceof ZodError) {
    return fail("Validation failed", 422, err.flatten());
  }
  if (err instanceof AuthError) {
    return fail(err.message, err.status);
  }
  logger.error({ err: String(err) }, "Unhandled API error");
  return fail("Something went wrong", 500);
}

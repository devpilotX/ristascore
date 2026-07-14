/**
 * Shared Zod schemas. Used on both client and server so validation rules
 * never drift between the form and the API.
 */

import { z } from "zod";
import { CHECK_TYPES } from "./checks";

export const checkTypeSchema = z.enum(CHECK_TYPES);

export const registerSchema = z.object({
  full_name: z.string().min(2, "Please enter your full name").max(120),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().max(20).optional().or(z.literal("")),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Please enter your password"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const consentSchema = z.object({
  authorized_checks: z
    .array(checkTypeSchema)
    .min(1, "Choose at least one check to authorise"),
  i_agree: z.literal(true, {
    errorMap: () => ({ message: "You must agree to give consent" }),
  }),
});
export type ConsentInput = z.infer<typeof consentSchema>;

// claimed_data is an open map. Providers decide which fields they need.
export const claimedDataSchema = z.record(z.string(), z.union([z.string(), z.number()]));

export const verificationSchema = z.object({
  consent_id: z.string().min(1, "consent_id is required"),
  claimed_data: claimedDataSchema.default({}),
  visible_fields: z.array(checkTypeSchema).optional(),
});
export type VerificationInput = z.infer<typeof verificationSchema>;

export const apiKeySchema = z.object({
  label: z.string().min(2, "Give the key a label").max(80),
});
export type ApiKeyInput = z.infer<typeof apiKeySchema>;

export const disputeSchema = z.object({
  check_result_id: z.string().min(1),
  reason: z.string().min(5, "Please describe the problem").max(1000),
});
export type DisputeInput = z.infer<typeof disputeSchema>;

export const disputeResolveSchema = z.object({
  status: z.enum(["resolved", "rejected", "under_review"]),
  resolution: z.string().min(1).max(1000),
});

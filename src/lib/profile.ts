/**
 * Profile validation schema and completeness scoring.
 *
 * The form submits strings; we coerce numbers and treat empty strings as
 * "not provided" so a partial profile can be saved and finished later.
 */

import { z } from "zod";
import { GENDERS, MARITAL_STATES, DIETS, HABITS } from "./matrimony";

/** Empty string -> undefined, so optional fields validate cleanly. */
const emptyToUndef = (v: unknown) => (typeof v === "string" && v.trim() === "" ? undefined : v);

const optStr = z.preprocess(emptyToUndef, z.string().trim().max(120).optional());
const optText = z.preprocess(emptyToUndef, z.string().trim().max(2000).optional());
const optInt = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
  z.coerce.number().int().positive().optional(),
);

export const profileSchema = z.object({
  gender: z.enum(GENDERS),
  date_of_birth: z.preprocess(
    emptyToUndef,
    z
      .string()
      .refine((s) => !Number.isNaN(Date.parse(s)), "Enter a valid date of birth")
      .refine((s) => {
        const d = new Date(s);
        const now = new Date();
        const age = now.getFullYear() - d.getFullYear() - (now < new Date(now.getFullYear(), d.getMonth(), d.getDate()) ? 1 : 0);
        return age >= 18 && age <= 100;
      }, "You must be between 18 and 100"),
  ),
  height_cm: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.coerce.number().int().min(120).max(230).optional(),
  ),
  marital_state: z.enum(MARITAL_STATES),
  religion: optStr,
  community: optStr,
  mother_tongue: optStr,
  country: optStr,
  state: optStr,
  city: z.preprocess(emptyToUndef, z.string().trim().min(2, "City is required").max(120)),
  education: optStr,
  education_field: optStr,
  profession: optStr,
  employer: optStr,
  annual_income: optInt,
  diet: z.preprocess(emptyToUndef, z.enum(DIETS).optional()),
  smoking: z.preprocess(emptyToUndef, z.enum(HABITS).optional()),
  drinking: z.preprocess(emptyToUndef, z.enum(HABITS).optional()),
  headline: z.preprocess(emptyToUndef, z.string().trim().max(140).optional()),
  about: optText,
  family_details: optText,
  // Partner preferences
  pref_gender: z.preprocess(emptyToUndef, z.enum(GENDERS).optional()),
  pref_age_min: optInt,
  pref_age_max: optInt,
  pref_height_min_cm: optInt,
  pref_height_max_cm: optInt,
  pref_religion: optStr,
  pref_community: optStr,
  pref_marital_state: optStr,
  pref_diet: optStr,
  pref_location: optStr,
  pref_education: optStr,
  pref_notes: optText,
});

export type ProfileInput = z.infer<typeof profileSchema>;

/** Fields that count toward profile completeness, weighted equally. */
const COMPLETENESS_FIELDS = [
  "gender",
  "date_of_birth",
  "height_cm",
  "marital_state",
  "religion",
  "community",
  "mother_tongue",
  "city",
  "education",
  "profession",
  "annual_income",
  "diet",
  "headline",
  "about",
  "family_details",
  "pref_age_min",
  "pref_age_max",
] as const;

/** 0..100 percentage of key fields filled in. */
export function computeCompleteness(p: Record<string, unknown>): number {
  let filled = 0;
  for (const f of COMPLETENESS_FIELDS) {
    const v = p[f];
    if (v !== undefined && v !== null && String(v).trim() !== "") filled += 1;
  }
  return Math.round((filled / COMPLETENESS_FIELDS.length) * 100);
}

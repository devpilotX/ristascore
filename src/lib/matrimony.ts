/**
 * Matrimony domain constants, labels, and small pure helpers.
 *
 * Kept free of Prisma/DB imports so it can be used in client components, the
 * search form, and server code alike. Values mirror the Prisma enums.
 */

export const GENDERS = ["male", "female"] as const;
export type Gender = (typeof GENDERS)[number];
export const GENDER_LABELS: Record<Gender, string> = {
  male: "Male",
  female: "Female",
};

export const MARITAL_STATES = [
  "never_married",
  "divorced",
  "widowed",
  "awaiting_divorce",
] as const;
export type MaritalState = (typeof MARITAL_STATES)[number];
export const MARITAL_STATE_LABELS: Record<MaritalState, string> = {
  never_married: "Never married",
  divorced: "Divorced",
  widowed: "Widowed",
  awaiting_divorce: "Awaiting divorce",
};

export const DIETS = ["vegetarian", "non_vegetarian", "eggetarian", "vegan", "jain"] as const;
export type Diet = (typeof DIETS)[number];
export const DIET_LABELS: Record<Diet, string> = {
  vegetarian: "Vegetarian",
  non_vegetarian: "Non-vegetarian",
  eggetarian: "Eggetarian",
  vegan: "Vegan",
  jain: "Jain",
};

export const HABITS = ["no", "occasionally", "yes"] as const;
export type Habit = (typeof HABITS)[number];
export const HABIT_LABELS: Record<Habit, string> = {
  no: "No",
  occasionally: "Occasionally",
  yes: "Yes",
};

export const INTEREST_STATUSES = ["sent", "accepted", "declined", "withdrawn"] as const;
export type InterestStatus = (typeof INTEREST_STATUSES)[number];

/** Common religions in India for the select. "Other" allows free choice. */
export const RELIGIONS = [
  "Hindu",
  "Muslim",
  "Christian",
  "Sikh",
  "Jain",
  "Buddhist",
  "Parsi",
  "Jewish",
  "Spiritual",
  "No religion",
  "Other",
] as const;

export const MOTHER_TONGUES = [
  "Hindi",
  "Marathi",
  "Tamil",
  "Telugu",
  "Kannada",
  "Malayalam",
  "Bengali",
  "Gujarati",
  "Punjabi",
  "Odia",
  "Assamese",
  "Urdu",
  "Konkani",
  "English",
  "Other",
] as const;

export const EDUCATION_LEVELS = [
  "High School",
  "Diploma",
  "Bachelors",
  "Masters",
  "Doctorate",
  "Professional Degree",
  "Other",
] as const;

/** Income bands in INR per year, used to label and to drive the min filter. */
export const INCOME_BANDS: Array<{ label: string; min: number }> = [
  { label: "Any income", min: 0 },
  { label: "₹3 LPA+", min: 300000 },
  { label: "₹5 LPA+", min: 500000 },
  { label: "₹10 LPA+", min: 1000000 },
  { label: "₹20 LPA+", min: 2000000 },
  { label: "₹50 LPA+", min: 5000000 },
  { label: "₹1 Cr+", min: 10000000 },
];

/** Whole-year age from a date of birth. */
export function ageFromDob(dob: Date | string): number {
  const d = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  return age;
}

/** Convert a height in cm to a friendly "5' 8\" (173 cm)" string. */
export function heightLabel(cm?: number | null): string {
  if (!cm) return "Not specified";
  const totalInches = Math.round(cm / 2.54);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return `${feet}' ${inches}" (${cm} cm)`;
}

/** Format INR/year compactly: 1200000 -> "₹12 LPA". */
export function incomeLabel(annual?: number | null): string {
  if (!annual || annual <= 0) return "Not specified";
  if (annual >= 10000000) return `₹${(annual / 10000000).toFixed(annual % 10000000 ? 1 : 0)} Cr`;
  return `₹${Math.round(annual / 100000)} LPA`;
}

/** Heights in cm for select options, 140 to 200. */
export const HEIGHT_OPTIONS: Array<{ value: number; label: string }> = Array.from(
  { length: 61 },
  (_, i) => {
    const cm = 140 + i;
    return { value: cm, label: heightLabel(cm) };
  },
);

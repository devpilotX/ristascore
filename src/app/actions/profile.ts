"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth-helpers";
import { profileSchema, computeCompleteness } from "@/lib/profile";

export interface ProfileState {
  error?: string;
  ok?: string;
}

const FIELDS = [
  "gender",
  "date_of_birth",
  "height_cm",
  "marital_state",
  "religion",
  "community",
  "mother_tongue",
  "country",
  "state",
  "city",
  "education",
  "education_field",
  "profession",
  "employer",
  "annual_income",
  "diet",
  "smoking",
  "drinking",
  "headline",
  "about",
  "family_details",
  "pref_gender",
  "pref_age_min",
  "pref_age_max",
  "pref_height_min_cm",
  "pref_height_max_cm",
  "pref_religion",
  "pref_community",
  "pref_marital_state",
  "pref_diet",
  "pref_location",
  "pref_education",
  "pref_notes",
] as const;

export async function saveProfileAction(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const user = await requireUser();

  const raw: Record<string, unknown> = {};
  for (const f of FIELDS) {
    const v = formData.get(f);
    if (typeof v === "string") raw[f] = v;
  }

  const parsed = profileSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again" };
  }

  const data = parsed.data;
  const isPublished = formData.get("is_published") === "on";

  // Completeness is computed from the validated, normalised data.
  const completeness = computeCompleteness(data as Record<string, unknown>);

  const dob = new Date(data.date_of_birth);

  const values = {
    gender: data.gender,
    date_of_birth: dob,
    height_cm: data.height_cm ?? null,
    marital_state: data.marital_state,
    religion: data.religion ?? null,
    community: data.community ?? null,
    mother_tongue: data.mother_tongue ?? null,
    country: data.country ?? "India",
    state: data.state ?? null,
    city: data.city,
    education: data.education ?? null,
    education_field: data.education_field ?? null,
    profession: data.profession ?? null,
    employer: data.employer ?? null,
    annual_income: data.annual_income ?? null,
    diet: data.diet ?? null,
    smoking: data.smoking ?? null,
    drinking: data.drinking ?? null,
    headline: data.headline ?? null,
    about: data.about ?? null,
    family_details: data.family_details ?? null,
    pref_gender: data.pref_gender ?? null,
    pref_age_min: data.pref_age_min ?? null,
    pref_age_max: data.pref_age_max ?? null,
    pref_height_min_cm: data.pref_height_min_cm ?? null,
    pref_height_max_cm: data.pref_height_max_cm ?? null,
    pref_religion: data.pref_religion ?? null,
    pref_community: data.pref_community ?? null,
    pref_marital_state: data.pref_marital_state ?? null,
    pref_diet: data.pref_diet ?? null,
    pref_location: data.pref_location ?? null,
    pref_education: data.pref_education ?? null,
    pref_notes: data.pref_notes ?? null,
    is_published: isPublished,
    completeness,
  };

  await db.profile.upsert({
    where: { user_id: user.id },
    create: { user_id: user.id, ...values },
    update: values,
  });

  revalidatePath("/profile");
  revalidatePath("/search");
  return {
    ok: isPublished
      ? `Profile saved and published. It is ${completeness}% complete.`
      : `Profile saved as a draft (${completeness}% complete). Publish it to appear in search.`,
  };
}

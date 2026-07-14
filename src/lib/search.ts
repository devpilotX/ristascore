/**
 * Search query builder for profile discovery.
 *
 * Turns raw URL search params into a validated Prisma `where`, `orderBy`, and
 * pagination. All filters are optional and safe: unknown values are ignored.
 */

import type { Prisma } from "@prisma/client";
import { GENDERS, MARITAL_STATES, DIETS } from "./matrimony";

export const PAGE_SIZE = 12;

export type SortKey = "newest" | "completeness" | "youngest" | "oldest";

export interface ParsedSearch {
  where: Prisma.ProfileWhereInput;
  orderBy: Prisma.ProfileOrderByWithRelationInput[];
  page: number;
  skip: number;
  take: number;
  sort: SortKey;
  /** Echo of the applied filters for re-rendering the form. */
  filters: Record<string, string>;
}

type Params = Record<string, string | string[] | undefined>;

function str(params: Params, key: string): string | undefined {
  const v = params[key];
  const s = Array.isArray(v) ? v[0] : v;
  const t = (s ?? "").trim();
  return t.length ? t : undefined;
}

function int(params: Params, key: string): number | undefined {
  const s = str(params, key);
  if (s === undefined) return undefined;
  const n = Number.parseInt(s, 10);
  return Number.isFinite(n) ? n : undefined;
}

/** Date that was exactly `years` ago from today. */
function yearsAgo(years: number): Date {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  return d;
}

export function parseSearch(params: Params, selfUserId?: string): ParsedSearch {
  const filters: Record<string, string> = {};
  const record = (k: string, v?: string) => {
    if (v !== undefined) filters[k] = v;
  };

  const where: Prisma.ProfileWhereInput = { is_published: true };
  if (selfUserId) where.user_id = { not: selfUserId };

  const gender = str(params, "gender");
  if (gender && (GENDERS as readonly string[]).includes(gender)) {
    where.gender = gender as (typeof GENDERS)[number];
    record("gender", gender);
  }

  const marital = str(params, "marital_state");
  if (marital && (MARITAL_STATES as readonly string[]).includes(marital)) {
    where.marital_state = marital as (typeof MARITAL_STATES)[number];
    record("marital_state", marital);
  }

  const diet = str(params, "diet");
  if (diet && (DIETS as readonly string[]).includes(diet)) {
    where.diet = diet as (typeof DIETS)[number];
    record("diet", diet);
  }

  const religion = str(params, "religion");
  if (religion) {
    where.religion = religion;
    record("religion", religion);
  }

  const community = str(params, "community");
  if (community) {
    where.community = { contains: community, mode: "insensitive" };
    record("community", community);
  }

  const city = str(params, "city");
  if (city) {
    where.city = { contains: city, mode: "insensitive" };
    record("city", city);
  }

  const education = str(params, "education");
  if (education) {
    where.education = education;
    record("education", education);
  }

  const profession = str(params, "profession");
  if (profession) {
    where.profession = { contains: profession, mode: "insensitive" };
    record("profession", profession);
  }

  const incomeMin = int(params, "income_min");
  if (incomeMin && incomeMin > 0) {
    where.annual_income = { gte: incomeMin };
    record("income_min", String(incomeMin));
  }

  // Age range -> date_of_birth range.
  const ageMin = int(params, "age_min");
  const ageMax = int(params, "age_max");
  if ((ageMin && ageMin >= 18) || (ageMax && ageMax >= 18)) {
    const dob: Prisma.DateTimeFilter = {};
    if (ageMax && ageMax >= 18) dob.gte = yearsAgo(ageMax + 1); // not older than ageMax
    if (ageMin && ageMin >= 18) dob.lte = yearsAgo(ageMin); // at least ageMin
    where.date_of_birth = dob;
    if (ageMin) record("age_min", String(ageMin));
    if (ageMax) record("age_max", String(ageMax));
  }

  // Verified-only: the profile's user has at least one active trust badge.
  if (str(params, "verified") === "1") {
    where.user = { verifications: { some: { badge: { is_active: true } } } };
    record("verified", "1");
  }

  const sort = (str(params, "sort") as SortKey) ?? "newest";
  record("sort", sort);
  const orderBy: Prisma.ProfileOrderByWithRelationInput[] =
    sort === "completeness"
      ? [{ completeness: "desc" }, { created_at: "desc" }]
      : sort === "youngest"
        ? [{ date_of_birth: "desc" }]
        : sort === "oldest"
          ? [{ date_of_birth: "asc" }]
          : [{ created_at: "desc" }];

  const page = Math.max(1, int(params, "page") ?? 1);

  return {
    where,
    orderBy,
    page,
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    sort,
    filters,
  };
}

/** Build a query string preserving filters but overriding `page`. */
export function pageHref(filters: Record<string, string>, page: number): string {
  const sp = new URLSearchParams(filters);
  sp.set("page", String(page));
  return `/search?${sp.toString()}`;
}

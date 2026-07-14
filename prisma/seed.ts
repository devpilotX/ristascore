/**
 * Seed script.
 *
 * Creates the admin user, a sample subject, and a set of demo matrimony
 * profiles so search, discovery, and matchmaking have realistic data on first
 * boot. A few profiles get a verified Trust Badge (issued in sandbox mode) so
 * the "verified only" filter and badge UI can be demonstrated.
 *
 * Safe to run more than once: users are upserted by email and a profile is
 * created only if one does not already exist for that user.
 */

import {
  PrismaClient,
  UserRole,
  Gender,
  MaritalState,
  Diet,
  Habit,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";

const prisma = new PrismaClient();

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789";
function badgeToken(): string {
  const bytes = randomBytes(24);
  let out = "";
  for (let i = 0; i < 24; i += 1) out += ALPHABET[bytes[i]! % ALPHABET.length];
  return `rs_${out}`;
}

/** Date of birth for a given age in whole years. */
function dobForAge(age: number): Date {
  const d = new Date();
  d.setFullYear(d.getFullYear() - age);
  d.setMonth(d.getMonth() - 3);
  return d;
}

interface DemoProfile {
  email: string;
  full_name: string;
  gender: Gender;
  age: number;
  height_cm: number;
  marital_state: MaritalState;
  religion: string;
  community: string;
  mother_tongue: string;
  city: string;
  state: string;
  education: string;
  education_field: string;
  profession: string;
  annual_income: number;
  diet: Diet;
  smoking: Habit;
  drinking: Habit;
  headline: string;
  about: string;
  verified?: boolean;
}

const DEMO: DemoProfile[] = [
  {
    email: "ananya@example.com", full_name: "Ananya Iyer", gender: Gender.female, age: 28, height_cm: 165,
    marital_state: MaritalState.never_married, religion: "Hindu", community: "Iyer", mother_tongue: "Tamil",
    city: "Bengaluru", state: "Karnataka", education: "Masters", education_field: "Computer Science",
    profession: "Product Manager", annual_income: 2800000, diet: Diet.vegetarian, smoking: Habit.no, drinking: Habit.no,
    headline: "Curious, kind, and always up for a good conversation.",
    about: "I work in tech, love classical music, weekend treks, and trying new cuisines. Looking for a partner who is grounded and ambitious.",
    verified: true,
  },
  {
    email: "rohan@example.com", full_name: "Rohan Deshmukh", gender: Gender.male, age: 31, height_cm: 178,
    marital_state: MaritalState.never_married, religion: "Hindu", community: "Maratha", mother_tongue: "Marathi",
    city: "Pune", state: "Maharashtra", education: "Bachelors", education_field: "Mechanical Engineering",
    profession: "Engineering Lead", annual_income: 3200000, diet: Diet.non_vegetarian, smoking: Habit.no, drinking: Habit.occasionally,
    headline: "Family-first, fitness-minded, and a terrible singer.",
    about: "Born and raised in Pune. I value honesty and humour. Enjoy cricket, road trips, and cooking on weekends.",
    verified: true,
  },
  {
    email: "fatima@example.com", full_name: "Fatima Sheikh", gender: Gender.female, age: 27, height_cm: 160,
    marital_state: MaritalState.never_married, religion: "Muslim", community: "Sunni", mother_tongue: "Urdu",
    city: "Hyderabad", state: "Telangana", education: "Masters", education_field: "Architecture",
    profession: "Architect", annual_income: 1500000, diet: Diet.non_vegetarian, smoking: Habit.no, drinking: Habit.no,
    headline: "Designing spaces by day, reading novels by night.",
    about: "I love art, heritage walks, and good biryani. Seeking someone respectful, warm, and progressive.",
  },
  {
    email: "arjun@example.com", full_name: "Arjun Nair", gender: Gender.male, age: 30, height_cm: 175,
    marital_state: MaritalState.never_married, religion: "Hindu", community: "Nair", mother_tongue: "Malayalam",
    city: "Chennai", state: "Tamil Nadu", education: "Masters", education_field: "Finance",
    profession: "Investment Analyst", annual_income: 2600000, diet: Diet.non_vegetarian, smoking: Habit.no, drinking: Habit.occasionally,
    headline: "Numbers person who loves the outdoors.",
    about: "Originally from Kochi, now in Chennai. Into scuba diving, finance, and long drives. Looking for an equal partner.",
    verified: true,
  },
  {
    email: "simran@example.com", full_name: "Simran Kaur", gender: Gender.female, age: 26, height_cm: 168,
    marital_state: MaritalState.never_married, religion: "Sikh", community: "Jat Sikh", mother_tongue: "Punjabi",
    city: "Delhi", state: "Delhi", education: "Bachelors", education_field: "Fashion Design",
    profession: "Fashion Designer", annual_income: 1200000, diet: Diet.vegetarian, smoking: Habit.no, drinking: Habit.no,
    headline: "Creative soul with a big laugh.",
    about: "I run a small label, love bhangra, and value family. Looking for someone genuine and fun-loving.",
  },
  {
    email: "vikram@example.com", full_name: "Vikram Reddy", gender: Gender.male, age: 33, height_cm: 180,
    marital_state: MaritalState.divorced, religion: "Hindu", community: "Reddy", mother_tongue: "Telugu",
    city: "Hyderabad", state: "Telangana", education: "Doctorate", education_field: "Biotechnology",
    profession: "Research Scientist", annual_income: 2200000, diet: Diet.vegetarian, smoking: Habit.no, drinking: Habit.no,
    headline: "Second innings, same optimism.",
    about: "Scientist and a dad to a lovely dog. Calm, considerate, and looking for a thoughtful partner to share life with.",
  },
  {
    email: "neha@example.com", full_name: "Neha Gupta", gender: Gender.female, age: 29, height_cm: 162,
    marital_state: MaritalState.never_married, religion: "Hindu", community: "Agarwal", mother_tongue: "Hindi",
    city: "Jaipur", state: "Rajasthan", education: "Masters", education_field: "Business Administration",
    profession: "Marketing Director", annual_income: 3000000, diet: Diet.vegetarian, smoking: Habit.no, drinking: Habit.occasionally,
    headline: "Ambitious, warm, and a foodie at heart.",
    about: "I lead marketing for a consumer brand. Love travel, theatre, and my joint family. Seeking a supportive, driven partner.",
  },
  {
    email: "joseph@example.com", full_name: "Joseph Thomas", gender: Gender.male, age: 32, height_cm: 177,
    marital_state: MaritalState.never_married, religion: "Christian", community: "Syrian Christian", mother_tongue: "Malayalam",
    city: "Kochi", state: "Kerala", education: "Bachelors", education_field: "Civil Engineering",
    profession: "Project Manager", annual_income: 1800000, diet: Diet.non_vegetarian, smoking: Habit.no, drinking: Habit.occasionally,
    headline: "Easy-going, faith-rooted, family-oriented.",
    about: "I build things for a living and love the backwaters. Looking for a caring partner who values family and faith.",
  },
  {
    email: "aisha@example.com", full_name: "Aisha Khan", gender: Gender.female, age: 30, height_cm: 164,
    marital_state: MaritalState.widowed, religion: "Muslim", community: "Pathan", mother_tongue: "Hindi",
    city: "Mumbai", state: "Maharashtra", education: "Masters", education_field: "Psychology",
    profession: "Clinical Psychologist", annual_income: 1600000, diet: Diet.non_vegetarian, smoking: Habit.no, drinking: Habit.no,
    headline: "Compassion is my superpower.",
    about: "I help people heal for a living. Looking to begin a new chapter with a mature, kind, and understanding partner.",
  },
  {
    email: "karan@example.com", full_name: "Karan Mehta", gender: Gender.male, age: 29, height_cm: 182,
    marital_state: MaritalState.never_married, religion: "Jain", community: "Gujarati Jain", mother_tongue: "Gujarati",
    city: "Mumbai", state: "Maharashtra", education: "Bachelors", education_field: "Commerce",
    profession: "Entrepreneur", annual_income: 4000000, diet: Diet.jain, smoking: Habit.no, drinking: Habit.no,
    headline: "Builder, traveller, eternal optimist.",
    about: "I run a D2C business. Love startups, food (Jain), and badminton. Seeking a partner who is independent and warm.",
    verified: true,
  },
];

async function ensureProfile(p: DemoProfile, passwordHash: string) {
  const user = await prisma.user.upsert({
    where: { email: p.email },
    update: {},
    create: { email: p.email, hashed_password: passwordHash, full_name: p.full_name, role: UserRole.subject },
  });

  const existing = await prisma.profile.findUnique({ where: { user_id: user.id } });
  if (!existing) {
    await prisma.profile.create({
      data: {
        user_id: user.id,
        gender: p.gender,
        date_of_birth: dobForAge(p.age),
        height_cm: p.height_cm,
        marital_state: p.marital_state,
        religion: p.religion,
        community: p.community,
        mother_tongue: p.mother_tongue,
        country: "India",
        state: p.state,
        city: p.city,
        education: p.education,
        education_field: p.education_field,
        profession: p.profession,
        annual_income: p.annual_income,
        diet: p.diet,
        smoking: p.smoking,
        drinking: p.drinking,
        headline: p.headline,
        about: p.about,
        pref_gender: p.gender === Gender.male ? Gender.female : Gender.male,
        pref_age_min: 24,
        pref_age_max: 36,
        is_published: true,
        completeness: 90,
      },
    });
  }

  if (p.verified) await ensureVerifiedBadge(user.id, p.full_name, p.city);
  return user.id;
}

/** Create a completed sandbox verification + active badge for a user. */
async function ensureVerifiedBadge(userId: string, fullName: string, city: string) {
  const existing = await prisma.trustBadge.findFirst({
    where: { request: { subject_id: userId }, is_active: true },
  });
  if (existing) return;

  const checks = ["government_id", "employment_income", "education", "marital_status", "criminal_record"] as const;
  const consent = await prisma.consent.create({
    data: {
      user_id: userId,
      authorized_checks: [...checks],
      consent_text: "Demo seed consent for a sandbox Trust Badge.",
    },
  });

  const request = await prisma.verificationRequest.create({
    data: {
      subject_id: userId,
      consent_id: consent.id,
      claimed_data: { full_name: fullName, city },
      status: "completed",
      verification_mode: "sandbox",
      completed_at: new Date(),
    },
  });

  // Scores mirror the engine: 180 each, marital capped at 153 -> total 873, A+.
  const breakdown = checks.map((c) => ({
    check_type: c,
    label: c,
    status: "verified",
    score: c === "marital_status" ? 153 : 180,
    max_score: 180,
  }));
  const total = breakdown.reduce((s, b) => s + b.score, 0);

  for (const b of breakdown) {
    await prisma.checkResult.create({
      data: {
        request_id: request.id,
        check_type: b.check_type,
        status: "verified",
        provider_name: "Seed sandbox provider",
        provider_response: { simulated: true, mode: "sandbox" },
        summary: "[SANDBOX] Demo verified result.",
        score_contribution: b.score,
      },
    });
  }

  await prisma.trustScore.create({
    data: { request_id: request.id, total_score: total, max_score: 900, grade: "A+", breakdown, coverage: { attempted: 5, verified: 5, unverifiable: 0, mismatch: 0, pending: 0 } },
  });

  const expires = new Date();
  expires.setDate(expires.getDate() + 180);
  await prisma.trustBadge.create({
    data: { request_id: request.id, token: badgeToken(), visible_fields: [...checks], expires_at: expires },
  });
}

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@rishtascore.local";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@12345";
  const adminHash = await bcrypt.hash(adminPassword, 10);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: { email: adminEmail, hashed_password: adminHash, full_name: "RishtaScore Admin", role: UserRole.admin },
  });
  console.log(`Admin ready: ${adminEmail}`);

  const demoHash = await bcrypt.hash("Demo@12345", 10);

  // Sample subject Asha, now with a profile too.
  const ashaHash = await bcrypt.hash("Asha@12345", 10);
  const asha = await prisma.user.upsert({
    where: { email: "asha@example.com" },
    update: {},
    create: { email: "asha@example.com", hashed_password: ashaHash, full_name: "Asha Rao", phone: "+91-90000-00000", role: UserRole.subject },
  });
  const ashaProfile = await prisma.profile.findUnique({ where: { user_id: asha.id } });
  if (!ashaProfile) {
    await prisma.profile.create({
      data: {
        user_id: asha.id, gender: Gender.female, date_of_birth: dobForAge(27), height_cm: 163,
        marital_state: MaritalState.never_married, religion: "Hindu", community: "Brahmin", mother_tongue: "Kannada",
        country: "India", state: "Karnataka", city: "Bengaluru", education: "Masters", education_field: "Data Science",
        profession: "Data Scientist", annual_income: 2400000, diet: Diet.vegetarian, smoking: Habit.no, drinking: Habit.no,
        headline: "Logical mind, warm heart.", about: "I love data, dosas, and weekend hikes.",
        pref_gender: Gender.male, pref_age_min: 27, pref_age_max: 35, is_published: true, completeness: 88,
      },
    });
  }
  await ensureVerifiedBadge(asha.id, "Asha Rao", "Bengaluru");
  console.log("Sample subject ready: asha@example.com (password Asha@12345)");

  for (const p of DEMO) await ensureProfile(p, demoHash);
  console.log(`Seeded ${DEMO.length} demo profiles (password Demo@12345).`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

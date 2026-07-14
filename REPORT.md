# RishtaScore — Launch Report

This is the honest status of the platform: what works today, what does not yet,
and exactly what you must provide to go fully live. Nothing is faked silently.

---

## 1. What is fully working at launch (with payments OFF)

These features are complete, build clean (`npm run build`), pass unit tests
(`npm run test`, 15/15), typecheck clean (`npm run typecheck`), and were smoke
tested on localhost.

### Matrimony core (the product)
- **Registration & login** — real accounts, bcrypt, JWT session in httpOnly
  cookies, role-based access.
- **Profiles** — multi-section create/edit at `/profile` (basics, community,
  location, education, career, lifestyle, about, family, partner preferences),
  with validation, an 18+ check, draft/publish control, and a live completeness
  meter.
- **Search & discovery** — `/search` with filters (gender, age range, city,
  religion, community, marital status, education, profession, diet, minimum
  income, verified-only), sorting (newest, most complete, youngest, oldest), and
  pagination. Works without JavaScript (plain GET form).
- **Profile detail** — `/u/[id]` shows full profile, trust badge, and
  relationship-aware actions; logs profile views; hides unpublished profiles
  from everyone but the owner.
- **Matchmaking** — shortlist/save, express interest (with a note), withdraw,
  accept/decline, and a `/matches` dashboard (received, connections, sent,
  shortlisted).
- **Messaging** — once two people connect (accepted interest), they can message
  at `/messages` and `/messages/[id]`. Membership and connection are enforced
  server-side; read receipts are tracked.

### Trust / verification (sandbox mode)
- The full consent → verification → 0–900 score → portable badge loop.
- **Honest labelling**: a site-wide "Demo mode" banner, `[SANDBOX]` summaries,
  and clear copy everywhere stating checks are simulated, not yet confirmed
  against live government sources.
- **Token UX**: the badge page explains what the `rs_` token is, how to copy and
  share it (token, link, QR), and how a recipient verifies it at `/verify`.
  Every public view is audit-logged; revoking consent disables the badge.
- Public badge page, QR image, and the B2B verify API with API keys.

### Platform
- PostgreSQL schema with indexes designed for filtered search at scale,
  migrations, and a seed with an admin, a sample user, and 10 demo profiles
  (5 verified).
- API under `/api/v1` (auth, consent, verification, badges, API keys, admin,
  disputes, health, payments).
- Synchronous verification with no Redis; queued via BullMQ when `REDIS_URL` is
  set.

**Seeded demo logins** (password shown):
- Admin: `admin@rishtascore.local` / `Admin@12345`
- Sample: `asha@example.com` / `Asha@12345`
- Demo members: `ananya@example.com`, `rohan@example.com`, `karan@example.com`,
  … all with password `Demo@12345`.

---

## 2. What is NOT live yet, and why

### Real government verification (the big one)
Every check runs in **sandbox** (simulated) mode. Live access to DigiLocker,
EPFO/Account Aggregator, NAD, eCourts, and police sources requires approved
accounts, licences, and in most cases a commercial contract — these cannot be
self-served in code. The architecture is fully built: each check has a `Live*`
provider with a `configured` guard and a clearly marked integration point, and
flipping `VERIFICATION_MODE=live` routes to them. See **VERIFICATION.md** for the
exact consent/API flow and credentials per source. Until a source is connected,
its check returns an honest `pending` — never a fake `verified`.

### Payments
Disabled by default (`PAYMENTS_ENABLED=false`). The pricing section is live and
honest ("free during launch"). A pluggable `PaymentProvider` abstraction is in
place with a complete **Razorpay** implementation and a **PayPal** scaffold;
PayPal drops in by implementing one method and setting env vars — no rework.
All core features work with payments off.

### Photos
Profiles support photos in the schema and UI (avatar/initials fallback), but
image **upload/storage** (e.g. S3/Cloudinary) is not wired. Add an uploader and
a storage adapter to enable real photos.

### Real-time chat
Messaging is database-backed and works, but is not real-time (no
websockets/polling). Messages appear on refresh/navigation.

---

## 3. Go-live checklist — what I need from you

Hand these over and we ship. Items are grouped; none are optional for a feature
you want live.

### A. Hosting & infrastructure
- [ ] **Host account** (recommended: Vercel) for the Next.js app.
- [ ] **Managed Postgres** (Neon or Supabase): connection string → `DATABASE_URL`.
- [ ] **Managed Redis** (Upstash) *(optional, for queued verification at scale)* →
      `REDIS_URL`.
- [ ] **Domain** (e.g. rishtascore.com) + DNS access; set `PUBLIC_BASE_URL`.
      SSL is automatic on Vercel.
- [ ] Strong `NEXTAUTH_SECRET` (≥32 chars) and `COOKIE_SECURE=true`.

### B. Verification sources (per VERIFICATION.md)
The fastest path is one KYC/BGV aggregator (Signzy, IDfy, HyperVerge,
Karza/Perfios, AuthBridge) that already holds these licences. Otherwise, direct:
- [ ] **DigiLocker** partner/requester account → `DIGILOCKER_CLIENT_ID`,
      `DIGILOCKER_CLIENT_SECRET`, `DIGILOCKER_REDIRECT_URI` (Government ID).
- [ ] **PAN** verification provider (Protean/NSDL or aggregator) (Government ID).
- [ ] **Account Aggregator / FIU** registration or TSP partner → `AA_CLIENT_ID`,
      `AA_CLIENT_SECRET`, `AA_BASE_URL` (Employment & Income / EPFO).
- [ ] **NAD / DigiLocker academic** access → `NAD_API_KEY`, `NAD_BASE_URL`
      (Education).
- [ ] **eCourts** API or litigation-search aggregator → `ECOURTS_API_KEY`,
      `ECOURTS_BASE_URL` + a notarisation/e-stamp partner (Marital status).
- [ ] **Licensed BGV agency** (PCC / court check) → `POLICE_API_KEY`,
      `POLICE_BASE_URL` (Criminal record).
- [ ] After credentials are set, set `VERIFICATION_MODE=live`.

### C. Payments
- [ ] Decide gateway. For **PayPal**: business account → `PAYPAL_CLIENT_ID`,
      `PAYPAL_CLIENT_SECRET`, `PAYPAL_WEBHOOK_ID`, `PAYPAL_MODE`, and ~1 day to
      implement the two scaffolded methods.
- [ ] For **Razorpay** (already implemented): `RAZORPAY_KEY_ID`,
      `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` + business KYC + public
      webhook URL.
- [ ] Set `PAYMENTS_ENABLED=true` and `PAYMENT_PROVIDER` when ready.

### D. Communications
- [ ] **Email** (Resend): `RESEND_API_KEY` + verified sender domain `RESEND_FROM`.
- [ ] **SMS/OTP** (MSG91 or Twilio): `SMS_PROVIDER` + matching keys.

### E. Media & legal
- [ ] **Photo storage** (S3 or Cloudinary) credentials, if you want photo upload.
- [ ] **Lawyer-approved** consent text, privacy policy, and terms for DPDP Act
      2023 (you are the Data Fiduciary). The grievance/officer details for the
      footer links.
- [ ] *(Optional)* `SENTRY_DSN` for error monitoring.

---

## 4. Recommended next steps (engineering, post-handover)
1. Photo upload + storage adapter (highest user-facing impact after launch).
2. Move rate limiting from in-memory to Redis for multi-instance scale
   (`src/lib/rate-limit.ts`), and add rate limiting to matchmaking/message
   server actions.
3. Implement one verification provider end-to-end (start with DigiLocker via an
   aggregator) and flip it live.
4. Light real-time for chat (polling or websockets) and unread badges in the nav.
5. "Who viewed me" surfacing (data is already captured in `ProfileView`).

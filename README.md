# RishtaScore

A consent based trust score for marriage. A person agrees to specific background
checks, gets a portable 0 to 900 Trust Badge, and shares it with families or
matrimony platforms. Think of it as a trust score for marriage, at a fraction of
the cost of a private detective.

Core loop: register, give consent, run verification, compute a 0 to 900 score,
issue a portable badge, then third parties verify it with a public link, a QR
code, or a B2B API.

## What is inside

- Next.js (App Router) with TypeScript in strict mode, one codebase for the
  frontend and the backend.
- PostgreSQL with Prisma. Auth.js v5 credentials login with bcrypt and roles.
- A pure, unit tested scoring engine. Five checks, up to 180 points each, 900 max.
- Five pluggable verification providers, shipped as realistic mocks with clean
  seams to swap in real integrations.
- API under `/api/v1` for auth, consent, verification, badges, API keys, admin,
  disputes, and health.
- Optional background jobs with BullMQ and Redis, with a synchronous fallback so
  the app works with no Redis at all.
- Payments (Razorpay), email (Resend), and SMS (MSG91 or Twilio) behind small
  adapters that fall back to safe stubs when no keys are set.
- Docker and docker compose for a one command boot.

## Quickstart with Docker (one command)

You need Docker Desktop running. From the project folder:

```
docker compose up --build
```

This starts Postgres, Redis, the app, and the worker. On start it applies the
database migrations and seeds an admin user. Open http://localhost:3000.

Default admin login (change these in production):

- email: `admin@rishtascore.local`
- password: `Admin@12345`

A sample subject is also seeded: `asha@example.com` with password `Asha@12345`.

## Local development (without Docker)

You need Node 20 or newer and a PostgreSQL database. Redis is optional. On
Windows PowerShell, run commands one per line. Do not use `&&`.

```
copy .env.example .env
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Open http://localhost:3000.

If you do not set `REDIS_URL`, verification runs synchronously in the web
process, which is perfect for development. If you do set it, also run the worker
in a second terminal:

```
npm run worker
```

## Useful scripts

```
npm run dev          # start the dev server
npm run build        # generate Prisma client and build
npm run start        # start the production build
npm run test         # run the scoring engine unit tests (Vitest)
npm run test:e2e     # run the Playwright end to end test
npm run typecheck    # TypeScript type check
npm run prisma:studio# open Prisma Studio
```

## How the score works

- Five categories, each worth up to 180 points, for a total of 900.
- Only a verified result earns points. Unverifiable, mismatch, and pending earn
  zero, so unchecked claims can never out score honest verified data.
- Marital status is capped at 153 to reflect that it is affidavit based and best
  effort, never absolute.
- Grades: A+ is 750 and up, A is 650, B+ is 550, B is 450, C is 350, D is the
  rest.

## Privacy and consent

- No check runs without an explicit, timestamped consent record.
- Revoking consent immediately deactivates linked badges. A public badge then
  returns 410 Gone.
- Every badge view, public or B2B, writes an audit log row.
- Raw government ID numbers are never stored. Only a masked last 4 reference is
  kept.
- Logs redact PII. Cookies are httpOnly. The app refuses to start in production
  with a weak or placeholder secret.

## Deploy

Recommended managed setup: Vercel for the app, Neon or Supabase for Postgres,
and Upstash for Redis. Set the environment variables from `.env.example` in your
host. Run `npx prisma migrate deploy` against the managed database, then deploy.

See `REPORT.md` for what is automated and what still needs a human, an account,
or money.

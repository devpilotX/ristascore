/**
 * Environment configuration and validation.
 *
 * The app refuses to start in production with weak or placeholder secrets.
 * In development we allow sensible defaults so the core loop just works.
 */

const isProd = process.env.NODE_ENV === "production";

// During `next build` the env is not the runtime env, so do not enforce the
// production secret rules then. Validation happens at server boot instead.
const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";

const PLACEHOLDERS = [
  "",
  "change-me",
  "change-me-in-production-please-use-a-long-random-value",
  "secret",
  "placeholder",
];

function required(name: string, value: string | undefined): string {
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function validateSecret(name: string, value: string | undefined): string {
  const v = value ?? "";
  if (isProd && !isBuildPhase) {
    if (PLACEHOLDERS.includes(v) || v.length < 32) {
      throw new Error(
        `Refusing to start in production: ${name} is missing, a placeholder, or too short. ` +
          `Set a strong random value of at least 32 characters.`,
      );
    }
  }
  return v;
}

export const env = {
  isProd,
  databaseUrl: required("DATABASE_URL", process.env.DATABASE_URL),
  publicBaseUrl: process.env.PUBLIC_BASE_URL || "http://localhost:3000",
  nextAuthSecret: validateSecret("NEXTAUTH_SECRET", process.env.NEXTAUTH_SECRET),
  cookieSecure: process.env.COOKIE_SECURE === "true",
  redisUrl: process.env.REDIS_URL || "",
  adminEmail: process.env.ADMIN_EMAIL || "admin@rishtascore.local",
  adminPassword: process.env.ADMIN_PASSWORD || "Admin@12345",
  logLevel: process.env.LOG_LEVEL || "info",
  // Global verification mode. "sandbox" (default) runs simulated checks that are
  // clearly labelled in the UI and never claim to be backed by live sources.
  // "live" routes each check to its real provider, but only if that provider's
  // credentials are present (otherwise that single check is reported pending).
  verificationMode: (process.env.VERIFICATION_MODE || "sandbox").toLowerCase() === "live"
    ? "live"
    : "sandbox",
  // Per-provider live credentials. Each block is empty until you obtain real
  // access. See VERIFICATION.md for exactly what each one requires.
  providers: {
    digilocker: {
      clientId: process.env.DIGILOCKER_CLIENT_ID || "",
      clientSecret: process.env.DIGILOCKER_CLIENT_SECRET || "",
      redirectUri: process.env.DIGILOCKER_REDIRECT_URI || "",
    },
    accountAggregator: {
      clientId: process.env.AA_CLIENT_ID || "",
      clientSecret: process.env.AA_CLIENT_SECRET || "",
      baseUrl: process.env.AA_BASE_URL || "",
    },
    nad: {
      apiKey: process.env.NAD_API_KEY || "",
      baseUrl: process.env.NAD_BASE_URL || "",
    },
    ecourts: {
      apiKey: process.env.ECOURTS_API_KEY || "",
      baseUrl: process.env.ECOURTS_BASE_URL || "",
    },
    police: {
      apiKey: process.env.POLICE_API_KEY || "",
      baseUrl: process.env.POLICE_BASE_URL || "",
    },
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || "",
    keySecret: process.env.RAZORPAY_KEY_SECRET || "",
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || "",
  },
  paypal: {
    clientId: process.env.PAYPAL_CLIENT_ID || "",
    clientSecret: process.env.PAYPAL_CLIENT_SECRET || "",
    webhookId: process.env.PAYPAL_WEBHOOK_ID || "",
    mode: (process.env.PAYPAL_MODE || "sandbox").toLowerCase() === "live" ? "live" : "sandbox",
  },
  paymentsEnabled: process.env.PAYMENTS_ENABLED === "true",
  resend: {
    apiKey: process.env.RESEND_API_KEY || "",
    from: process.env.RESEND_FROM || "RishtaScore <no-reply@rishtascore.local>",
  },
  sms: {
    provider: process.env.SMS_PROVIDER || "",
    msg91Key: process.env.MSG91_AUTH_KEY || "",
    twilioSid: process.env.TWILIO_ACCOUNT_SID || "",
    twilioToken: process.env.TWILIO_AUTH_TOKEN || "",
    twilioFrom: process.env.TWILIO_FROM || "",
  },
};

export const hasRedis = env.redisUrl.trim().length > 0;

/** True only when the platform is configured to run real, live verifications. */
export const isLiveVerification = env.verificationMode === "live";

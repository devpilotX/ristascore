/**
 * Verification providers.
 *
 * RishtaScore runs in one of two modes, controlled by VERIFICATION_MODE:
 *
 *  - "sandbox" (default): every check is SIMULATED. Results are clearly marked
 *    `mode: "sandbox"` and the UI labels any badge produced this way as a demo.
 *    No claim is made that the data was checked against a live source. This lets
 *    the full product loop run with no external accounts.
 *
 *  - "live": each check is routed to its real provider. A real integration only
 *    runs if that provider's credentials are present in the environment. If they
 *    are missing, that single check returns `pending` (never a fake "verified"),
 *    so we never overstate what was actually confirmed.
 *
 * The seams below (LiveXProvider classes) are where the real API clients plug in.
 * See VERIFICATION.md for the exact consent + API flow and required credentials
 * for DigiLocker/UIDAI, EPFO via Account Aggregator, NAD, eCourts, and Police.
 *
 * Privacy: providers never echo back raw government ID numbers. Sensitive values
 * are masked to the last 4 characters before being stored.
 */

import { CheckType, MARITAL_STATUS_CAP, MAX_PER_CHECK } from "../checks";
import { env } from "../env";
import {
  VerificationProvider,
  VerificationResult,
  hasRequiredFields,
  maskLast4,
} from "./types";

function sandboxVerified(
  provider_name: string,
  score: number,
  summary: string,
  raw: Record<string, unknown>,
): VerificationResult {
  return {
    status: "verified",
    score_contribution: score,
    summary: `[SANDBOX] ${summary}`,
    provider_name,
    mode: "sandbox",
    raw_response: { simulated: true, mode: "sandbox", ...raw },
  };
}

function unverifiableResult(
  provider_name: string,
  missing: string[],
  mode: "sandbox" | "live" = "sandbox",
): VerificationResult {
  return {
    status: "unverifiable",
    score_contribution: 0,
    summary: `Could not verify. Missing or empty fields: ${missing.join(", ")}.`,
    provider_name,
    mode,
    raw_response: { simulated: mode === "sandbox", mode, missing },
  };
}

/** A live check whose credentials are not configured yet. Honest "pending". */
function pendingNotConfigured(provider_name: string): VerificationResult {
  return {
    status: "pending",
    score_contribution: 0,
    summary:
      "Live verification for this check is not yet configured. No live source was contacted.",
    provider_name,
    mode: "live",
    raw_response: { simulated: false, mode: "live", configured: false },
  };
}

function missingFields(data: Record<string, unknown>, fields: string[]): string[] {
  return fields.filter((f) => {
    const v = data[f];
    return v === undefined || v === null || String(v).trim().length === 0;
  });
}

/* ------------------------------------------------------------------ *
 * Sandbox providers. Simulated, clearly labelled, no external calls.  *
 * ------------------------------------------------------------------ */

class SandboxGovernmentId implements VerificationProvider {
  readonly check_type: CheckType = "government_id";
  readonly provider_name = "DigiLocker / UIDAI / PAN-NSDL (sandbox)";
  readonly required_fields = ["full_name", "id_number"];
  readonly max_score = MAX_PER_CHECK;
  async verify(data: Record<string, unknown>): Promise<VerificationResult> {
    if (!hasRequiredFields(data, this.required_fields)) {
      return unverifiableResult(this.provider_name, missingFields(data, this.required_fields));
    }
    return sandboxVerified(
      this.provider_name,
      this.max_score,
      "Simulated government ID match. In live mode this calls DigiLocker/UIDAI with the user's consent.",
      { id_last4: maskLast4(data.id_number), name_match: true },
    );
  }
}

class SandboxEmploymentIncome implements VerificationProvider {
  readonly check_type: CheckType = "employment_income";
  readonly provider_name = "EPFO + Account Aggregator (sandbox)";
  readonly required_fields = ["employer_name", "monthly_income"];
  readonly max_score = MAX_PER_CHECK;
  async verify(data: Record<string, unknown>): Promise<VerificationResult> {
    if (!hasRequiredFields(data, this.required_fields)) {
      return unverifiableResult(this.provider_name, missingFields(data, this.required_fields));
    }
    return sandboxVerified(
      this.provider_name,
      this.max_score,
      "Simulated employment and income check. In live mode this uses EPFO and an Account Aggregator consent.",
      { employer_match: true, income_band: "confirmed" },
    );
  }
}

class SandboxEducation implements VerificationProvider {
  readonly check_type: CheckType = "education";
  readonly provider_name = "NAD / DigiLocker Academic (sandbox)";
  readonly required_fields = ["highest_qualification", "institution"];
  readonly max_score = MAX_PER_CHECK;
  async verify(data: Record<string, unknown>): Promise<VerificationResult> {
    if (!hasRequiredFields(data, this.required_fields)) {
      return unverifiableResult(this.provider_name, missingFields(data, this.required_fields));
    }
    return sandboxVerified(
      this.provider_name,
      this.max_score,
      "Simulated degree check. In live mode this queries the National Academic Depository.",
      { degree_match: true },
    );
  }
}

class SandboxMaritalStatus implements VerificationProvider {
  readonly check_type: CheckType = "marital_status";
  readonly provider_name = "eCourts + Notarised Affidavit (sandbox)";
  readonly required_fields = ["marital_status"];
  readonly max_score = MARITAL_STATUS_CAP;
  async verify(data: Record<string, unknown>): Promise<VerificationResult> {
    if (!hasRequiredFields(data, this.required_fields)) {
      return unverifiableResult(this.provider_name, missingFields(data, this.required_fields));
    }
    return sandboxVerified(
      this.provider_name,
      this.max_score,
      "Simulated marital status check. Even in live mode this is affidavit based, best effort, never absolute.",
      { declared_status: String(data.marital_status), affidavit: true },
    );
  }
}

class SandboxCriminalRecord implements VerificationProvider {
  readonly check_type: CheckType = "criminal_record";
  readonly provider_name = "Police Clearance / Court Records (sandbox)";
  readonly required_fields = ["full_name", "city"];
  readonly max_score = MAX_PER_CHECK;
  async verify(data: Record<string, unknown>): Promise<VerificationResult> {
    if (!hasRequiredFields(data, this.required_fields)) {
      return unverifiableResult(this.provider_name, missingFields(data, this.required_fields));
    }
    return sandboxVerified(
      this.provider_name,
      this.max_score,
      "Simulated criminal record check. In live mode this uses consented police and eCourts sources.",
      { records_found: 0 },
    );
  }
}

/* ------------------------------------------------------------------ *
 * Live providers. Real integrations plug in here. Until credentials   *
 * are present each returns an honest "pending", never a fake result.  *
 * ------------------------------------------------------------------ */

class LiveGovernmentId implements VerificationProvider {
  readonly check_type: CheckType = "government_id";
  readonly provider_name = "DigiLocker / UIDAI / PAN-NSDL";
  readonly required_fields = ["full_name", "id_number"];
  readonly max_score = MAX_PER_CHECK;
  private get configured() {
    return Boolean(env.providers.digilocker.clientId && env.providers.digilocker.clientSecret);
  }
  async verify(_data: Record<string, unknown>): Promise<VerificationResult> {
    if (!this.configured) return pendingNotConfigured(this.provider_name);
    // TODO: exchange DigiLocker auth code -> access token -> pull issued Aadhaar/PAN
    // documents, match name/DOB, mask id to last 4. See VERIFICATION.md.
    throw new Error("DigiLocker live client not implemented yet");
  }
}

class LiveEmploymentIncome implements VerificationProvider {
  readonly check_type: CheckType = "employment_income";
  readonly provider_name = "EPFO + Account Aggregator (Sahamati)";
  readonly required_fields = ["employer_name", "monthly_income"];
  readonly max_score = MAX_PER_CHECK;
  private get configured() {
    return Boolean(env.providers.accountAggregator.clientId);
  }
  async verify(_data: Record<string, unknown>): Promise<VerificationResult> {
    if (!this.configured) return pendingNotConfigured(this.provider_name);
    throw new Error("Account Aggregator live client not implemented yet");
  }
}

class LiveEducation implements VerificationProvider {
  readonly check_type: CheckType = "education";
  readonly provider_name = "NAD / DigiLocker Academic";
  readonly required_fields = ["highest_qualification", "institution"];
  readonly max_score = MAX_PER_CHECK;
  private get configured() {
    return Boolean(env.providers.nad.apiKey);
  }
  async verify(_data: Record<string, unknown>): Promise<VerificationResult> {
    if (!this.configured) return pendingNotConfigured(this.provider_name);
    throw new Error("NAD live client not implemented yet");
  }
}

class LiveMaritalStatus implements VerificationProvider {
  readonly check_type: CheckType = "marital_status";
  readonly provider_name = "eCourts + Notarised Affidavit";
  readonly required_fields = ["marital_status"];
  readonly max_score = MARITAL_STATUS_CAP;
  private get configured() {
    return Boolean(env.providers.ecourts.apiKey);
  }
  async verify(_data: Record<string, unknown>): Promise<VerificationResult> {
    if (!this.configured) return pendingNotConfigured(this.provider_name);
    throw new Error("eCourts live client not implemented yet");
  }
}

class LiveCriminalRecord implements VerificationProvider {
  readonly check_type: CheckType = "criminal_record";
  readonly provider_name = "Police Clearance / Court Records";
  readonly required_fields = ["full_name", "city"];
  readonly max_score = MAX_PER_CHECK;
  private get configured() {
    return Boolean(env.providers.police.apiKey || env.providers.ecourts.apiKey);
  }
  async verify(_data: Record<string, unknown>): Promise<VerificationResult> {
    if (!this.configured) return pendingNotConfigured(this.provider_name);
    throw new Error("Police/eCourts live client not implemented yet");
  }
}

const SANDBOX_PROVIDERS: Record<CheckType, VerificationProvider> = {
  government_id: new SandboxGovernmentId(),
  employment_income: new SandboxEmploymentIncome(),
  education: new SandboxEducation(),
  marital_status: new SandboxMaritalStatus(),
  criminal_record: new SandboxCriminalRecord(),
};

const LIVE_PROVIDERS: Record<CheckType, VerificationProvider> = {
  government_id: new LiveGovernmentId(),
  employment_income: new LiveEmploymentIncome(),
  education: new LiveEducation(),
  marital_status: new LiveMaritalStatus(),
  criminal_record: new LiveCriminalRecord(),
};

/** Pick the provider for a check type, honouring the global verification mode. */
export function getProvider(checkType: CheckType): VerificationProvider {
  return env.verificationMode === "live"
    ? LIVE_PROVIDERS[checkType]
    : SANDBOX_PROVIDERS[checkType];
}

export { SANDBOX_PROVIDERS, LIVE_PROVIDERS };

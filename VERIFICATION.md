# Verification: how it really works

This document is the honest source of truth for what RishtaScore's five checks
can and cannot do today, how each real integration works, and exactly what you
need to obtain to switch each one from sandbox to live.

## Two modes

The platform runs in one of two modes, set by the `VERIFICATION_MODE` env var:

- `sandbox` (default): every check is **simulated**. Results are stamped
  `mode: "sandbox"`, the summary is prefixed `[SANDBOX]`, and the whole UI shows
  a "Demo mode" banner. Nothing claims to be confirmed against a live source.
- `live`: each check routes to its real provider. A check only runs for real if
  that provider's credentials are present; otherwise it returns an honest
  `pending` (never a fake `verified`).

Code seams live in `src/lib/providers/index.ts` (`LiveGovernmentId`,
`LiveEmploymentIncome`, `LiveEducation`, `LiveMaritalStatus`,
`LiveCriminalRecord`). Each has a `configured` check and a clearly marked `TODO`
where the real API client is wired in. The scoring engine and API never change.

## The five checks

### 1. Government ID — DigiLocker / UIDAI / PAN-NSDL
- **What it verifies:** that a government identity document (Aadhaar, PAN,
  driving licence) genuinely belongs to the user and the name/DOB match.
- **Real flow:** OAuth 2.0 consent. The user is redirected to DigiLocker, logs
  in, and approves sharing specific issued documents. We exchange the auth code
  for an access token, pull the issued document(s), match name/DOB, and store
  only a masked last-4 reference. Aadhaar e-KYC/Aadhaar number use is tightly
  restricted by UIDAI; in practice most platforms verify via DigiLocker issued
  documents and PAN through the NSDL/Protean PAN verification API.
- **Possible today?** Yes, via DigiLocker partner access and a PAN verification
  agency. Direct UIDAI Aadhaar authentication is restricted to licensed AUA/KUA
  entities.
- **You need:** a DigiLocker partner/requester account (Meripehchaan/API
  Setu), `DIGILOCKER_CLIENT_ID`, `DIGILOCKER_CLIENT_SECRET`,
  `DIGILOCKER_REDIRECT_URI`; for PAN, an account with an authorised PAN
  verification provider (Protean/NSDL or an aggregator such as Signzy, IDfy,
  HyperVerge, Karza/Perfios).

### 2. Employment & Income — EPFO + Account Aggregator (Sahamati)
- **What it verifies:** current/past employment (EPF contributions) and an
  income band from bank statements.
- **Real flow:** EPFO data and salary inflows are accessed via the RBI
  Account Aggregator framework. The user grants a consent artefact through a
  licensed AA; a regulated Financial Information User (FIU) then receives the
  data. We confirm employer and an income band, not exact figures.
- **Possible today?** Yes, but you must be (or partner with) a registered FIU
  and integrate a licensed AA / TSP. Direct EPFO passbook scraping is not a
  compliant path.
- **You need:** FIU registration or a TSP partner, `AA_CLIENT_ID`,
  `AA_CLIENT_SECRET`, `AA_BASE_URL` (e.g. Finvu, OneMoney, Anumati, Perfios).

### 3. Education — NAD / DigiLocker Academic
- **What it verifies:** degree, institution, and year against the issuing
  university's digitally signed record.
- **Real flow:** Academic awards issued to DigiLocker / National Academic
  Depository (DigiLocker NAD or NDML/CVL NAD) are pulled with user consent and
  matched. Not every institution has uploaded records yet, so coverage varies.
- **Possible today?** Partially. Works where the institution publishes to NAD;
  otherwise falls back to manual document upload + review.
- **You need:** NAD/DigiLocker academic access, `NAD_API_KEY`, `NAD_BASE_URL`,
  or an aggregator that wraps NAD.

### 4. Marital Status — eCourts + Notarised Affidavit
- **What it verifies:** declared marital status, supported by a notarised
  affidavit and a best-effort search of court records for divorce/matrimonial
  cases.
- **Real flow:** There is **no single national marital-status registry** in
  India. We combine (a) a self-declared, notarised affidavit and (b) an eCourts
  search for matrimonial cases by name/locality. This is inherently best effort,
  which is why the score is capped (153, not 180) and the UI says so.
- **Possible today?** Partially, and never absolute. eCourts has services/APIs
  but coverage and matching quality vary.
- **You need:** eCourts API access (or a litigation-search aggregator like
  Signzy/IDfy court-check), `ECOURTS_API_KEY`, `ECOURTS_BASE_URL`, plus a
  notarisation/e-stamp workflow partner.

### 5. Criminal Record — Police Clearance / Court Records
- **What it verifies:** absence of adverse police/court records.
- **Real flow:** Police Clearance Certificate (PCC) is issued by state police /
  Passport Seva and generally requires the subject's own application; there is
  no open API to query arbitrary individuals (by design, for privacy). The
  practical product path is: the user obtains/uploads a PCC, or authorises a
  licensed background-verification agency to run a court-record + database check
  with consent.
- **Possible today?** Via licensed BGV agencies (AuthBridge, IDfy, HyperVerge,
  First Advantage) with explicit consent, and/or user-supplied PCC. Real-time
  direct police DB access is not available to private platforms.
- **You need:** a contract with a licensed BGV agency, `POLICE_API_KEY`,
  `POLICE_BASE_URL`; optionally eCourts access as above.

## Compliance notes (read before going live)
- **DPDP Act 2023:** consent must be specific, informed, and revocable; you are
  a Data Fiduciary. The existing consent records, revocation, and audit logs are
  the right foundation.
- **Aadhaar:** do not store Aadhaar numbers. The code already masks to last 4.
  Aadhaar authentication requires AUA/KUA licensing — prefer DigiLocker.
- **Account Aggregator:** you must be a registered FIU or contract one. Do not
  scrape EPFO/bank portals.
- **Most teams ship faster by contracting one KYC/BGV aggregator** (Signzy,
  IDfy, HyperVerge, Karza/Perfios, AuthBridge) that already holds the
  DigiLocker/PAN/court/BGV licences, then wiring a single client into the five
  `Live*` providers. The architecture here supports either path.

## Switching a check to live
1. Obtain the credentials above and set them in the environment.
2. Implement the real client inside the matching `Live*` provider's `verify()`
   (replace the `TODO` / `throw`). Return a normalised `VerificationResult` with
   `mode: "live"` and a masked, PII-safe `raw_response`.
3. Set `VERIFICATION_MODE=live`. Checks with credentials run live; any without
   credentials remain honest `pending`. The demo banner disappears.

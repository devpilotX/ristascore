import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { CHECK_LABELS, CheckType } from "@/lib/checks";
import { VerificationForm } from "@/components/verification-form";
import { revokeConsentAction } from "@/app/actions/dashboard";

function fmt(d: Date) {
  return new Date(d).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [consents, requests] = await Promise.all([
    db.consent.findMany({ where: { user_id: user.id }, orderBy: { consented_at: "desc" } }),
    db.verificationRequest.findMany({
      where: { subject_id: user.id },
      orderBy: { created_at: "desc" },
      include: { trust_score: true, badge: true },
    }),
  ]);

  return (
    <div className="wrap" style={{ paddingTop: 34, paddingBottom: 30 }}>
      <div className="steps">
        <div className="step active">
          <b>Step 1</b> Give consent
        </div>
        <div className="step">
          <b>Step 2</b> Get verified
        </div>
        <div className="step">
          <b>Step 3</b> Your badge
        </div>
      </div>

      <VerificationForm />

      <h2 style={{ fontSize: 25, margin: "36px 0 14px" }}>Your consent records</h2>
      <div className="card">
        <table className="data">
          <thead>
            <tr>
              <th>Checks</th>
              <th>Granted</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {consents.length === 0 && (
              <tr>
                <td colSpan={4} className="muted">
                  No consent records yet. Run your first verification above.
                </td>
              </tr>
            )}
            {consents.map((c) => (
              <tr key={c.id}>
                <td className="small">
                  {(c.authorized_checks as CheckType[]).map((x) => CHECK_LABELS[x]).join(", ")}
                </td>
                <td className="small">{fmt(c.consented_at)}</td>
                <td>
                  <span className={`badge-status ${c.is_active ? "s-verified" : "s-mismatch"}`}>
                    {c.is_active ? "active" : "revoked"}
                  </span>
                </td>
                <td>
                  {c.is_active && (
                    <form action={revokeConsentAction}>
                      <input type="hidden" name="consent_id" value={c.id} />
                      <button className="btn btn-sm btn-danger" type="submit">
                        Revoke
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 style={{ fontSize: 25, margin: "36px 0 14px" }}>Your badges</h2>
      <p className="muted small" style={{ marginTop: -8, marginBottom: 14, maxWidth: 720 }}>
        Each completed verification issues a portable token (starting <code>rs_</code>). Open a
        badge to copy its token, share link, and QR code, then send it to a prospective match.
        They verify it at <Link href="/verify">Verify a Match</Link>. Revoking the related consent
        disables the badge instantly.
      </p>
      <div className="card">
        <table className="data">
          <thead>
            <tr>
              <th>Issued</th>
              <th>Score</th>
              <th>Grade</th>
              <th>Token</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {requests.filter((r) => r.badge).length === 0 && (
              <tr>
                <td colSpan={6} className="muted">
                  No badges yet.
                </td>
              </tr>
            )}
            {requests
              .filter((r) => r.badge)
              .map((r) => (
                <tr key={r.id}>
                  <td className="small">{r.badge && fmt(r.badge.issued_at)}</td>
                  <td>
                    <b>{r.trust_score?.total_score ?? 0}</b>
                  </td>
                  <td>{r.trust_score?.grade ?? "D"}</td>
                  <td className="small">{r.badge?.token.slice(0, 14)}...</td>
                  <td>
                    <span
                      className={`badge-status ${r.badge?.is_active ? "s-verified" : "s-mismatch"}`}
                    >
                      {r.badge?.is_active ? "active" : "revoked"}
                    </span>
                  </td>
                  <td>
                    {r.badge && (
                      <Link className="btn btn-sm btn-gold" href={`/badge/${r.badge.token}`}>
                        View
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

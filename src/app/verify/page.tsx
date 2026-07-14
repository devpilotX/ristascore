import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { lookupBadge, logBadgeView } from "@/lib/badge-service";
import { ScoreCircle } from "@/components/score-circle";
import { Ornament } from "@/components/icons";
import { clientIp } from "@/lib/rate-limit";

async function verifyAction(formData: FormData) {
  "use server";
  const token = String(formData.get("token") || "").trim();
  redirect(token ? `/verify?token=${encodeURIComponent(token)}` : "/verify");
}

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token?.trim();
  const result = token ? await lookupBadge(token) : null;

  // Every public view is logged.
  if (result && result.state === "ok") {
    const h = headers();
    await logBadgeView(result.badgeId, {
      ip: clientIp(h as unknown as Headers),
      userAgent: h.get("user-agent"),
    });
  }

  return (
    <div className="wrap" style={{ paddingTop: 34, paddingBottom: 30 }}>
      <div className="center" style={{ margin: "6px 0 20px" }}>
        <div className="flourish">{Ornament}</div>
        <span className="eyebrow">Public verification</span>
        <h2 style={{ fontSize: 34, marginTop: 8 }}>Verify a possible match</h2>
        <p className="muted">
          Enter a badge token to see its current, consented status. Every view is logged.
        </p>
        <p className="small muted" style={{ maxWidth: 620, margin: "8px auto 0" }}>
          The token looks like <code>rs_xxxx</code> and is shared with you by the person you are
          considering. They generate it from their own verified Trust Badge and choose to send it
          to you. You only ever see what they have consented to make visible.
        </p>
      </div>

      <form className="card card-cream" style={{ maxWidth: 580, margin: "0 auto" }} action={verifyAction}>
        <div className="row">
          <input name="token" defaultValue={token ?? ""} placeholder="rs_..." style={{ flex: 1 }} />
          <button className="btn" type="submit">
            Verify
          </button>
        </div>
      </form>

      <div style={{ marginTop: 22 }}>
        {token && result?.state === "not_found" && (
          <div className="card center">
            <h3 style={{ fontSize: 22 }}>No badge found</h3>
            <p className="muted">We could not find a badge with that token. Please check and try again.</p>
          </div>
        )}

        {token && result?.state === "gone" && (
          <div className="card center">
            <h3 style={{ fontSize: 22 }}>This badge is no longer active</h3>
            <p className="muted">{result.reason}</p>
          </div>
        )}

        {result?.state === "ok" && (
          <div className="card">
            <div className="grid grid-2" style={{ alignItems: "center" }}>
              <div className="center">
                <ScoreCircle
                  score={result.view.total_score}
                  grade={result.view.grade}
                  max={result.view.max_score}
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="qr" src={`/api/v1/badge/${result.view.token}/qr`} alt="Badge QR" />
                <p
                  className="serif"
                  style={{ fontSize: 23, color: "var(--maroon-dark)", margin: "12px 0 4px" }}
                >
                  {result.view.subject_name}
                </p>
                <span className="badge-status s-verified">Active badge</span>
              </div>
              <div>
                <h3 style={{ fontSize: 23, marginBottom: 6 }}>Current status</h3>
                <table className="data">
                  <thead>
                    <tr>
                      <th>Check</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.view.breakdown.map((x) => (
                      <tr key={x.check_type}>
                        <td>{x.label}</td>
                        <td>
                          <span className={`badge-status s-${x.status}`}>{x.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <p
              className="small muted"
              style={{ marginTop: 16, borderTop: "1px solid var(--line)", paddingTop: 14 }}
            >
              Shows the checks the badge holder chose to make visible, and their current consented
              status. Marital status is best effort and never absolute. While a check is in
              sandbox mode its status is simulated, not confirmed against a live source.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

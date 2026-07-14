import Link from "next/link";
import { notFound } from "next/navigation";
import { lookupBadge } from "@/lib/badge-service";
import { badgePublicUrl } from "@/lib/qr";
import { ScoreCircle } from "@/components/score-circle";
import { CopyShare } from "@/components/copy-share";
import { Ornament } from "@/components/icons";

export default async function BadgePage({ params }: { params: { token: string } }) {
  const result = await lookupBadge(params.token);

  if (result.state === "not_found") notFound();

  if (result.state === "gone") {
    return (
      <div className="wrap" style={{ paddingTop: 40, paddingBottom: 40 }}>
        <div className="card center" style={{ maxWidth: 560, margin: "0 auto" }}>
          <h2 style={{ fontSize: 28 }}>This badge is no longer active</h2>
          <p className="muted">{result.reason}</p>
          <Link className="btn btn-sm" href="/dashboard" style={{ marginTop: 12 }}>
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const b = result.view;
  const shareUrl = badgePublicUrl(b.token);

  return (
    <div className="wrap" style={{ paddingTop: 34, paddingBottom: 30 }}>
      <div className="steps">
        <div className="step">
          <b>Step 1</b> Give consent
        </div>
        <div className="step">
          <b>Step 2</b> Get verified
        </div>
        <div className="step active">
          <b>Step 3</b> Your badge
        </div>
      </div>

      <div className="card">
        <div className="center" style={{ marginBottom: 10 }}>
          <div className="flourish">{Ornament}</div>
          <span className="eyebrow">Verified Trust Badge</span>
        </div>
        <div className="grid grid-2" style={{ alignItems: "center" }}>
          <div className="center">
            <ScoreCircle score={b.total_score} grade={b.grade} max={b.max_score} animate />
            <p
              className="serif"
              style={{ fontSize: 25, color: "var(--maroon-dark)", margin: "14px 0 2px" }}
            >
              {b.subject_name}
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="qr" src={`/api/v1/badge/${b.token}/qr`} alt="Badge QR code" />
            <p className="small muted" style={{ margin: "8px 0 4px" }}>
              Shareable token
            </p>
            <div className="token-box">{b.token}</div>
            <div className="row" style={{ marginTop: 12, justifyContent: "center" }}>
              <Link className="btn btn-sm" href={`/verify?token=${b.token}`}>
                Open public badge
              </Link>
              <CopyShare text={b.token} label="Copy token" />
              <CopyShare text={shareUrl} />
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: 23, marginBottom: 6 }}>Verification breakdown</h3>
            <table className="data">
              <thead>
                <tr>
                  <th>Check</th>
                  <th>Status</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {b.breakdown.map((x) => (
                  <tr key={x.check_type}>
                    <td>{x.label}</td>
                    <td>
                      <span className={`badge-status s-${x.status}`}>{x.status}</span>
                    </td>
                    <td>
                      <b>{x.score}</b>
                      <span className="muted">/{x.max_score}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="small muted" style={{ marginTop: 12 }}>
              Only verified facts earn points. Unverifiable and mismatched data add zero, by
              design.
            </p>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 22 }}>
        <h3 style={{ fontSize: 22, marginBottom: 8 }}>How to share and verify this badge</h3>
        <div className="grid grid-3">
          <div>
            <div className="stepnum">1</div>
            <b>This token is yours</b>
            <p className="muted small" style={{ marginTop: 4 }}>
              The code starting <code>rs_</code> above is your portable proof. It was generated for
              you when your verification completed. Copy the token, the share link, or the QR code.
            </p>
          </div>
          <div>
            <div className="stepnum">2</div>
            <b>Share it with a match</b>
            <p className="muted small" style={{ marginTop: 4 }}>
              Send it to a prospective partner or their family. They open{" "}
              <Link href="/verify">Verify a Match</Link>, paste the token (or scan the QR), and see
              your current, consented status.
            </p>
          </div>
          <div>
            <div className="stepnum">3</div>
            <b>You stay in control</b>
            <p className="muted small" style={{ marginTop: 4 }}>
              Every view is logged for you, and you can revoke consent any time from{" "}
              <Link href="/dashboard">Verification</Link>. Revoking instantly disables this badge,
              so the link stops working.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

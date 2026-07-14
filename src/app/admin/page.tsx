import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { Ornament } from "@/components/icons";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard");

  const [users, consents, verifications, badges, activeBadges, disputes, views] =
    await Promise.all([
      db.user.count(),
      db.consent.count(),
      db.verificationRequest.count(),
      db.trustBadge.count(),
      db.trustBadge.count({ where: { is_active: true } }),
      db.dispute.count(),
      db.badgeAuditLog.count(),
    ]);

  const recent = await db.verificationRequest.findMany({
    orderBy: { created_at: "desc" },
    take: 20,
    include: {
      subject: { select: { full_name: true } },
      trust_score: { select: { total_score: true, grade: true } },
      badge: { select: { is_active: true } },
    },
  });

  const cards: Array<[string, number]> = [
    ["Users", users],
    ["Consents", consents],
    ["Verifications", verifications],
    ["Badges", badges],
    ["Active badges", activeBadges],
    ["Disputes", disputes],
    ["Badge views", views],
  ];

  return (
    <div className="wrap" style={{ paddingTop: 34, paddingBottom: 30 }}>
      <div className="center" style={{ margin: "6px 0 20px" }}>
        <div className="flourish">{Ornament}</div>
        <span className="eyebrow">Admin</span>
        <h2 style={{ fontSize: 34, marginTop: 8 }}>Platform overview</h2>
      </div>

      <div className="stats" style={{ marginBottom: 30 }}>
        {cards.map((c) => (
          <div className="s" key={c[0]}>
            <b>{c[1]}</b>
            <span>{c[0]}</span>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: 25, margin: "10px 0 14px" }}>Recent verifications</h2>
      <div className="card">
        <table className="data">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Score</th>
              <th>Grade</th>
              <th>Badge</th>
            </tr>
          </thead>
          <tbody>
            {recent.length === 0 && (
              <tr>
                <td colSpan={4} className="muted">
                  No verifications yet.
                </td>
              </tr>
            )}
            {recent.map((r) => (
              <tr key={r.id}>
                <td>{r.subject.full_name}</td>
                <td>
                  <b>{r.trust_score?.total_score ?? 0}</b>
                </td>
                <td>{r.trust_score?.grade ?? "D"}</td>
                <td>
                  <span
                    className={`badge-status ${r.badge?.is_active ? "s-verified" : "s-mismatch"}`}
                  >
                    {r.badge ? (r.badge.is_active ? "active" : "revoked") : "none"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

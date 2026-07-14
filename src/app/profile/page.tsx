import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { ProfileForm } from "@/components/profile-form";
import { Ornament } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [profile, activeBadge] = await Promise.all([
    db.profile.findUnique({ where: { user_id: user.id } }),
    db.trustBadge.findFirst({
      where: { request: { subject_id: user.id }, is_active: true },
      orderBy: { issued_at: "desc" },
      include: { request: { include: { trust_score: true } } },
    }),
  ]);

  const completeness = profile?.completeness ?? 0;

  return (
    <div className="wrap" style={{ paddingTop: 30, paddingBottom: 30 }}>
      <div className="center" style={{ margin: "6px 0 18px" }}>
        <div className="flourish">{Ornament}</div>
        <span className="eyebrow">Your portfolio</span>
        <h2 style={{ fontSize: 34, marginTop: 8 }}>
          {profile ? "Edit your profile" : "Create your profile"}
        </h2>
        <p className="muted">
          A complete, verified profile gets far more genuine interest. Fill in what you are
          comfortable sharing.
        </p>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 22 }}>
        <div className="card card-cream">
          <b style={{ color: "var(--maroon-dark)" }}>Profile completeness</b>
          <div
            style={{
              marginTop: 10,
              height: 12,
              borderRadius: 999,
              background: "var(--cream-2)",
              overflow: "hidden",
              border: "1px solid var(--line)",
            }}
          >
            <div
              style={{
                width: `${completeness}%`,
                height: "100%",
                background: "linear-gradient(90deg, var(--gold), var(--gold-dark))",
              }}
            />
          </div>
          <p className="small muted" style={{ marginTop: 8 }}>
            {completeness}% complete{" "}
            {profile?.is_published ? "· Published and visible in search" : "· Draft, not yet visible"}
          </p>
        </div>

        <div className="card card-cream">
          <b style={{ color: "var(--maroon-dark)" }}>Trust badge</b>
          {activeBadge ? (
            <p className="small muted" style={{ marginTop: 10 }}>
              Active badge · Score {activeBadge.request.trust_score?.total_score ?? 0}/900 (
              {activeBadge.request.trust_score?.grade ?? "D"}). It is shown on your public profile.{" "}
              <Link href={`/badge/${activeBadge.token}`}>View badge</Link>
            </p>
          ) : (
            <p className="small muted" style={{ marginTop: 10 }}>
              No verified badge yet. A Trust Badge builds confidence with matches and families.{" "}
              <Link href="/dashboard">Get verified</Link>
            </p>
          )}
        </div>
      </div>

      <ProfileForm profile={profile} />
    </div>
  );
}

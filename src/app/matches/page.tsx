import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-helpers";
import { respondInterestAction } from "@/app/actions/matchmaking";
import { ProfileCard, type ProfileCardData } from "@/components/profile-card";
import { Ornament } from "@/components/icons";

export const dynamic = "force-dynamic";

function toCard(u: any): ProfileCardData | null {
  if (!u?.profile) return null;
  const p = u.profile;
  return {
    user_id: u.id,
    full_name: u.full_name,
    gender: p.gender,
    date_of_birth: p.date_of_birth,
    height_cm: p.height_cm,
    city: p.city,
    religion: p.religion,
    community: p.community,
    education: p.education,
    profession: p.profession,
    annual_income: p.annual_income,
    headline: p.headline,
  };
}

const userInclude = {
  select: {
    id: true,
    full_name: true,
    profile: true,
  },
} as const;

export default async function MatchesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [incoming, sent, connectedA, connectedB, shortlists] = await Promise.all([
    db.interest.findMany({
      where: { to_user_id: user.id, status: "sent" },
      orderBy: { created_at: "desc" },
      include: { from_user: userInclude },
    }),
    db.interest.findMany({
      where: { from_user_id: user.id, status: { in: ["sent", "declined"] } },
      orderBy: { created_at: "desc" },
      include: { to_user: userInclude },
    }),
    db.interest.findMany({
      where: { from_user_id: user.id, status: "accepted" },
      include: { to_user: userInclude },
    }),
    db.interest.findMany({
      where: { to_user_id: user.id, status: "accepted" },
      include: { from_user: userInclude },
    }),
    db.shortlist.findMany({
      where: { owner_id: user.id },
      orderBy: { created_at: "desc" },
      include: { target: userInclude },
    }),
  ]);

  const connections = [
    ...connectedA.map((i) => i.to_user),
    ...connectedB.map((i) => i.from_user),
  ];

  return (
    <div className="wrap" style={{ paddingTop: 28, paddingBottom: 30 }}>
      <div className="center" style={{ margin: "4px 0 18px" }}>
        <div className="flourish">{Ornament}</div>
        <span className="eyebrow">Your matches</span>
        <h2 style={{ fontSize: 34, marginTop: 8 }}>Interests and connections</h2>
      </div>

      <h3 style={{ fontSize: 22, margin: "10px 0 12px" }}>
        Interest received ({incoming.length})
      </h3>
      {incoming.length === 0 ? (
        <p className="muted small">No new interest right now.</p>
      ) : (
        <div className="grid grid-3">
          {incoming.map((i) => {
            const card = toCard(i.from_user);
            if (!card) return null;
            return (
              <div key={i.id}>
                <ProfileCard p={card} />
                {i.message && (
                  <p className="small muted" style={{ margin: "6px 2px" }}>
                    &ldquo;{i.message}&rdquo;
                  </p>
                )}
                <div className="row" style={{ marginTop: 8 }}>
                  <form action={respondInterestAction}>
                    <input type="hidden" name="interest_id" value={i.id} />
                    <input type="hidden" name="decision" value="accept" />
                    <button className="btn btn-sm" type="submit">
                      Accept
                    </button>
                  </form>
                  <form action={respondInterestAction}>
                    <input type="hidden" name="interest_id" value={i.id} />
                    <input type="hidden" name="decision" value="decline" />
                    <button className="btn btn-sm btn-ghost" type="submit">
                      Decline
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <h3 style={{ fontSize: 22, margin: "30px 0 12px" }}>
        Connections ({connections.length})
      </h3>
      {connections.length === 0 ? (
        <p className="muted small">
          No connections yet. Accept an interest, or express interest from a profile.
        </p>
      ) : (
        <div className="grid grid-3">
          {connections.map((u) => {
            const card = toCard(u);
            return card ? <ProfileCard key={u.id} p={card} /> : null;
          })}
        </div>
      )}

      <h3 style={{ fontSize: 22, margin: "30px 0 12px" }}>Interest sent ({sent.length})</h3>
      {sent.length === 0 ? (
        <p className="muted small">You have not expressed interest in anyone yet.</p>
      ) : (
        <div className="grid grid-3">
          {sent.map((i) => {
            const card = toCard(i.to_user);
            if (!card) return null;
            return (
              <div key={i.id}>
                <ProfileCard p={card} />
                <p className="small muted" style={{ margin: "6px 2px" }}>
                  Status: {i.status}
                </p>
              </div>
            );
          })}
        </div>
      )}

      <h3 style={{ fontSize: 22, margin: "30px 0 12px" }}>
        Shortlisted ({shortlists.length})
      </h3>
      {shortlists.length === 0 ? (
        <p className="muted small">
          Nothing shortlisted. Save profiles you like from <Link href="/search">search</Link>.
        </p>
      ) : (
        <div className="grid grid-3">
          {shortlists.map((s) => {
            const card = toCard(s.target);
            return card ? <ProfileCard key={s.id} p={card} /> : null;
          })}
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-helpers";
import { ProfileActions } from "@/components/profile-actions";
import {
  ageFromDob,
  heightLabel,
  incomeLabel,
  GENDER_LABELS,
  MARITAL_STATE_LABELS,
  DIET_LABELS,
  HABIT_LABELS,
  type Gender,
  type MaritalState,
  type Diet,
  type Habit,
} from "@/lib/matrimony";

export const dynamic = "force-dynamic";

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <tr>
      <td className="small muted" style={{ width: 180 }}>
        {label}
      </td>
      <td className="small">{value}</td>
    </tr>
  );
}

export default async function PublicProfilePage({ params }: { params: { id: string } }) {
  const viewer = await getCurrentUser();

  const profile = await db.profile.findUnique({
    where: { user_id: params.id },
    include: {
      photos: { orderBy: { sort_order: "asc" } },
      user: {
        select: {
          id: true,
          full_name: true,
          verifications: {
            where: { badge: { is_active: true } },
            orderBy: { created_at: "desc" },
            take: 1,
            select: { trust_score: { select: { grade: true, total_score: true } }, badge: { select: { token: true } } },
          },
        },
      },
    },
  });

  if (!profile) notFound();
  // Only the owner can view an unpublished profile.
  if (!profile.is_published && viewer?.id !== profile.user_id) notFound();

  const isOwner = viewer?.id === profile.user_id;

  // Log a profile view (not for self, only signed-in viewers).
  if (viewer && !isOwner) {
    try {
      await db.profileView.create({ data: { viewer_id: viewer.id, viewed_id: profile.user_id } });
    } catch {
      /* view logging never blocks the page */
    }
  }

  // Relationship state for the viewer.
  let sentInterest: string | null = null;
  let incomingInterest: string | null = null;
  let shortlisted = false;
  let conversationId: string | null = null;
  if (viewer && !isOwner) {
    const [sent, incoming, sl] = await Promise.all([
      db.interest.findUnique({
        where: { from_user_id_to_user_id: { from_user_id: viewer.id, to_user_id: profile.user_id } },
        select: { status: true },
      }),
      db.interest.findUnique({
        where: { from_user_id_to_user_id: { from_user_id: profile.user_id, to_user_id: viewer.id } },
        select: { status: true },
      }),
      db.shortlist.findUnique({
        where: { owner_id_target_id: { owner_id: viewer.id, target_id: profile.user_id } },
        select: { id: true },
      }),
    ]);
    sentInterest = sent?.status ?? null;
    incomingInterest = incoming?.status ?? null;
    shortlisted = Boolean(sl);
    if (sent?.status === "accepted" || incoming?.status === "accepted") {
      const [a, b] = viewer.id < profile.user_id ? [viewer.id, profile.user_id] : [profile.user_id, viewer.id];
      const convo = await db.conversation.findUnique({
        where: { user_a_id_user_b_id: { user_a_id: a, user_b_id: b } },
        select: { id: true },
      });
      conversationId = convo?.id ?? null;
    }
  }

  const v = profile.user.verifications[0];
  const verified = Boolean(v);
  const age = ageFromDob(profile.date_of_birth);

  return (
    <div className="wrap" style={{ paddingTop: 28, paddingBottom: 30 }}>
      <Link className="small muted" href="/search">
        &larr; Back to search
      </Link>

      <div className="grid grid-2" style={{ marginTop: 14, alignItems: "start" }}>
        <div className="card">
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            {profile.photos[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.photos[0].url}
                alt={profile.user.full_name}
                style={{ width: 96, height: 96, borderRadius: "50%", objectFit: "cover" }}
              />
            ) : (
              <span className="avatar" style={{ width: 96, height: 96, fontSize: 36 }}>
                {profile.user.full_name.slice(0, 1)}
              </span>
            )}
            <div>
              <h2 style={{ fontSize: 30 }}>{profile.user.full_name}</h2>
              <p className="small muted" style={{ margin: "4px 0 0" }}>
                {age} yrs · {GENDER_LABELS[profile.gender as Gender]} · {profile.city ?? "India"}
              </p>
              {verified ? (
                <Link href={`/badge/${v!.badge!.token}`}>
                  <span className="badge-status s-verified" style={{ marginTop: 8, display: "inline-block" }}>
                    Verified · Trust score {v!.trust_score?.total_score ?? 0}/900 ({v!.trust_score?.grade ?? "D"})
                  </span>
                </Link>
              ) : (
                <span className="badge-status s-pending" style={{ marginTop: 8, display: "inline-block" }}>
                  Not verified yet
                </span>
              )}
            </div>
          </div>

          {profile.headline && (
            <p className="serif" style={{ fontSize: 20, color: "var(--maroon-dark)", marginTop: 14, fontStyle: "italic" }}>
              &ldquo;{profile.headline}&rdquo;
            </p>
          )}
          {profile.about && <p style={{ marginTop: 10, color: "#5d4a44" }}>{profile.about}</p>}

          {isOwner ? (
            <div className="row" style={{ marginTop: 16 }}>
              <Link className="btn btn-sm" href="/profile">
                Edit my profile
              </Link>
            </div>
          ) : (
            <ProfileActions
              targetId={profile.user_id}
              shortlisted={shortlisted}
              sentInterest={sentInterest}
              incomingInterest={incomingInterest}
              conversationId={conversationId}
              signedIn={Boolean(viewer)}
            />
          )}
        </div>

        <div className="card">
          <h3 style={{ fontSize: 22, marginBottom: 8 }}>Details</h3>
          <table className="data">
            <tbody>
              <Row label="Age" value={`${age} years`} />
              <Row label="Height" value={heightLabel(profile.height_cm)} />
              <Row label="Marital status" value={MARITAL_STATE_LABELS[profile.marital_state as MaritalState]} />
              <Row label="Religion" value={profile.religion} />
              <Row label="Community" value={profile.community} />
              <Row label="Mother tongue" value={profile.mother_tongue} />
              <Row label="Location" value={[profile.city, profile.state, profile.country].filter(Boolean).join(", ")} />
              <Row label="Education" value={[profile.education, profile.education_field].filter(Boolean).join(", ")} />
              <Row label="Profession" value={profile.profession} />
              <Row label="Income" value={incomeLabel(profile.annual_income)} />
              <Row label="Diet" value={profile.diet ? DIET_LABELS[profile.diet as Diet] : null} />
              <Row label="Smoking" value={profile.smoking ? HABIT_LABELS[profile.smoking as Habit] : null} />
              <Row label="Drinking" value={profile.drinking ? HABIT_LABELS[profile.drinking as Habit] : null} />
            </tbody>
          </table>

          {profile.family_details && (
            <>
              <h3 style={{ fontSize: 20, margin: "18px 0 6px" }}>Family</h3>
              <p className="small" style={{ color: "#5d4a44" }}>{profile.family_details}</p>
            </>
          )}
          {profile.pref_notes && (
            <>
              <h3 style={{ fontSize: 20, margin: "18px 0 6px" }}>Partner preferences</h3>
              <p className="small" style={{ color: "#5d4a44" }}>{profile.pref_notes}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

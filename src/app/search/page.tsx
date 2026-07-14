import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-helpers";
import { parseSearch, pageHref, PAGE_SIZE } from "@/lib/search";
import { ProfileCard, type ProfileCardData } from "@/components/profile-card";
import { Ornament } from "@/components/icons";
import {
  GENDERS,
  GENDER_LABELS,
  MARITAL_STATES,
  MARITAL_STATE_LABELS,
  DIETS,
  DIET_LABELS,
  RELIGIONS,
  EDUCATION_LEVELS,
  INCOME_BANDS,
} from "@/lib/matrimony";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const user = await getCurrentUser();
  const { where, orderBy, page, skip, take, filters, sort } = parseSearch(searchParams, user?.id);

  const [rows, total] = await Promise.all([
    db.profile.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        photos: { where: { is_primary: true }, take: 1 },
        user: {
          select: {
            id: true,
            full_name: true,
            verifications: {
              where: { badge: { is_active: true } },
              orderBy: { created_at: "desc" },
              take: 1,
              select: { trust_score: { select: { grade: true } } },
            },
          },
        },
      },
    }),
    db.profile.count({ where }),
  ]);

  const cards: ProfileCardData[] = rows.map((r) => ({
    user_id: r.user.id,
    full_name: r.user.full_name,
    gender: r.gender,
    date_of_birth: r.date_of_birth,
    height_cm: r.height_cm,
    city: r.city,
    religion: r.religion,
    community: r.community,
    education: r.education,
    profession: r.profession,
    annual_income: r.annual_income,
    headline: r.headline,
    verified: r.user.verifications.length > 0,
    grade: r.user.verifications[0]?.trust_score?.grade ?? null,
    photoUrl: r.photos[0]?.url ?? null,
  }));

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const f = filters;

  return (
    <div className="wrap" style={{ paddingTop: 28, paddingBottom: 30 }}>
      <div className="center" style={{ margin: "4px 0 18px" }}>
        <div className="flourish">{Ornament}</div>
        <span className="eyebrow">Discover</span>
        <h2 style={{ fontSize: 34, marginTop: 8 }}>Find your match</h2>
        <p className="muted">
          {total} {total === 1 ? "profile" : "profiles"} match your filters. Verified profiles
          carry a Trust Badge.
        </p>
      </div>

      {/* Filters: a plain GET form so search works without JavaScript. */}
      <form className="card card-cream" method="get" style={{ marginBottom: 22 }}>
        <div className="grid grid-3">
          <div>
            <label htmlFor="gender">Gender</label>
            <select id="gender" name="gender" defaultValue={f.gender ?? ""}>
              <option value="">Any</option>
              {GENDERS.map((g) => (
                <option key={g} value={g}>
                  {GENDER_LABELS[g]}
                </option>
              ))}
            </select>
          </div>
          <div className="row" style={{ alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <label htmlFor="age_min">Age from</label>
              <input id="age_min" name="age_min" type="number" min={18} max={100} defaultValue={f.age_min ?? ""} />
            </div>
            <div style={{ flex: 1 }}>
              <label htmlFor="age_max">Age to</label>
              <input id="age_max" name="age_max" type="number" min={18} max={100} defaultValue={f.age_max ?? ""} />
            </div>
          </div>
          <div>
            <label htmlFor="city">City</label>
            <input id="city" name="city" defaultValue={f.city ?? ""} placeholder="Any city" />
          </div>
          <div>
            <label htmlFor="religion">Religion</label>
            <select id="religion" name="religion" defaultValue={f.religion ?? ""}>
              <option value="">Any</option>
              {RELIGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="community">Community</label>
            <input id="community" name="community" defaultValue={f.community ?? ""} placeholder="Any" />
          </div>
          <div>
            <label htmlFor="marital_state">Marital status</label>
            <select id="marital_state" name="marital_state" defaultValue={f.marital_state ?? ""}>
              <option value="">Any</option>
              {MARITAL_STATES.map((m) => (
                <option key={m} value={m}>
                  {MARITAL_STATE_LABELS[m]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="education">Education</label>
            <select id="education" name="education" defaultValue={f.education ?? ""}>
              <option value="">Any</option>
              {EDUCATION_LEVELS.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="profession">Profession</label>
            <input id="profession" name="profession" defaultValue={f.profession ?? ""} placeholder="Any" />
          </div>
          <div>
            <label htmlFor="diet">Diet</label>
            <select id="diet" name="diet" defaultValue={f.diet ?? ""}>
              <option value="">Any</option>
              {DIETS.map((d) => (
                <option key={d} value={d}>
                  {DIET_LABELS[d]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="income_min">Minimum income</label>
            <select id="income_min" name="income_min" defaultValue={f.income_min ?? ""}>
              {INCOME_BANDS.map((b) => (
                <option key={b.min} value={b.min || ""}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="sort">Sort by</label>
            <select id="sort" name="sort" defaultValue={sort}>
              <option value="newest">Newest</option>
              <option value="completeness">Most complete</option>
              <option value="youngest">Youngest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <label className="check-opt" style={{ width: "100%" }}>
              <input type="checkbox" name="verified" value="1" defaultChecked={f.verified === "1"} />
              <span>Verified profiles only</span>
            </label>
          </div>
        </div>
        <div className="row" style={{ marginTop: 16 }}>
          <button className="btn" type="submit">
            Apply filters
          </button>
          <Link className="btn btn-ghost btn-sm" href="/search">
            Reset
          </Link>
        </div>
      </form>

      {cards.length === 0 ? (
        <div className="card center">
          <h3 style={{ fontSize: 22 }}>No profiles found</h3>
          <p className="muted">Try widening your filters, or check back as more members join.</p>
        </div>
      ) : (
        <div className="grid grid-3">
          {cards.map((c) => (
            <ProfileCard key={c.user_id} p={c} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="row" style={{ justifyContent: "center", marginTop: 26 }}>
          {page > 1 && (
            <Link className="btn btn-ghost btn-sm" href={pageHref(f, page - 1)}>
              Previous
            </Link>
          )}
          <span className="small muted">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link className="btn btn-ghost btn-sm" href={pageHref(f, page + 1)}>
              Next
            </Link>
          )}
        </div>
      )}

      {!user && (
        <p className="center small muted" style={{ marginTop: 22 }}>
          <Link href="/login">Log in</Link> or <Link href="/register">create a profile</Link> to
          shortlist, express interest, and message matches.
        </p>
      )}
    </div>
  );
}

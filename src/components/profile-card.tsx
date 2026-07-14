import Link from "next/link";
import {
  ageFromDob,
  heightLabel,
  incomeLabel,
  GENDER_LABELS,
  type Gender,
} from "@/lib/matrimony";

export interface ProfileCardData {
  user_id: string;
  full_name: string;
  gender: string;
  date_of_birth: Date | string;
  height_cm?: number | null;
  city?: string | null;
  religion?: string | null;
  community?: string | null;
  education?: string | null;
  profession?: string | null;
  annual_income?: number | null;
  headline?: string | null;
  verified?: boolean;
  grade?: string | null;
  photoUrl?: string | null;
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function ProfileCard({ p }: { p: ProfileCardData }) {
  const age = ageFromDob(p.date_of_birth);
  const meta = [
    `${age} yrs`,
    heightLabel(p.height_cm) !== "Not specified" ? heightLabel(p.height_cm).split(" (")[0] : null,
    p.city,
    GENDER_LABELS[p.gender as Gender] ?? p.gender,
  ].filter(Boolean);

  const detail = [p.profession, p.education].filter(Boolean).join(" · ");
  const faith = [p.religion, p.community].filter(Boolean).join(", ");

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
        {p.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.photoUrl}
            alt={p.full_name}
            style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover", flex: "none" }}
          />
        ) : (
          <span className="avatar" style={{ width: 64, height: 64, fontSize: 24 }}>
            {initials(p.full_name)}
          </span>
        )}
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span className="serif" style={{ fontSize: 22, color: "var(--maroon-dark)" }}>
              {p.full_name}
            </span>
            {p.verified && (
              <span className="badge-status s-verified">
                Verified{p.grade ? ` · ${p.grade}` : ""}
              </span>
            )}
          </div>
          <p className="small muted" style={{ margin: "2px 0 0" }}>
            {meta.join(" · ")}
          </p>
        </div>
      </div>

      {p.headline && (
        <p className="small" style={{ margin: 0, color: "#5d4a44", fontStyle: "italic" }}>
          &ldquo;{p.headline}&rdquo;
        </p>
      )}
      {detail && (
        <p className="small muted" style={{ margin: 0 }}>
          {detail}
        </p>
      )}
      {faith && (
        <p className="small muted" style={{ margin: 0 }}>
          {faith}
        </p>
      )}
      {p.annual_income ? (
        <p className="small muted" style={{ margin: 0 }}>
          {incomeLabel(p.annual_income)}
        </p>
      ) : null}

      <Link className="btn btn-sm" href={`/u/${p.user_id}`} style={{ marginTop: 6, alignSelf: "flex-start" }}>
        View profile
      </Link>
    </div>
  );
}

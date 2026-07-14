"use client";

import { useFormState, useFormStatus } from "react-dom";
import { saveProfileAction } from "@/app/actions/profile";
import {
  GENDERS,
  GENDER_LABELS,
  MARITAL_STATES,
  MARITAL_STATE_LABELS,
  DIETS,
  DIET_LABELS,
  HABITS,
  HABIT_LABELS,
  RELIGIONS,
  MOTHER_TONGUES,
  EDUCATION_LEVELS,
  HEIGHT_OPTIONS,
} from "@/lib/matrimony";

type ProfileLike = Record<string, any> | null;

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button className="btn" type="submit" disabled={pending} style={{ marginTop: 4 }}>
      {pending ? "Saving..." : "Save profile"}
    </button>
  );
}

function toDateInput(d: any): string {
  if (!d) return "";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export function ProfileForm({ profile }: { profile: ProfileLike }) {
  const [state, action] = useFormState(saveProfileAction, {});
  const p = profile ?? {};

  return (
    <form className="card" action={action}>
      {/* Basics */}
      <h2 style={{ fontSize: 26 }}>Basic details</h2>
      <div className="grid grid-2" style={{ marginTop: 12 }}>
        <div>
          <label htmlFor="gender">Gender *</label>
          <select id="gender" name="gender" defaultValue={p.gender ?? ""} required>
            <option value="" disabled>
              Select
            </option>
            {GENDERS.map((g) => (
              <option key={g} value={g}>
                {GENDER_LABELS[g]}
              </option>
            ))}
          </select>

          <label htmlFor="date_of_birth">Date of birth *</label>
          <input
            id="date_of_birth"
            name="date_of_birth"
            type="date"
            defaultValue={toDateInput(p.date_of_birth)}
            required
          />

          <label htmlFor="height_cm">Height</label>
          <select id="height_cm" name="height_cm" defaultValue={p.height_cm ?? ""}>
            <option value="">Not specified</option>
            {HEIGHT_OPTIONS.map((h) => (
              <option key={h.value} value={h.value}>
                {h.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="marital_state">Marital status *</label>
          <select id="marital_state" name="marital_state" defaultValue={p.marital_state ?? "never_married"} required>
            {MARITAL_STATES.map((m) => (
              <option key={m} value={m}>
                {MARITAL_STATE_LABELS[m]}
              </option>
            ))}
          </select>

          <label htmlFor="mother_tongue">Mother tongue</label>
          <select id="mother_tongue" name="mother_tongue" defaultValue={p.mother_tongue ?? ""}>
            <option value="">Select</option>
            {MOTHER_TONGUES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <label htmlFor="headline">Profile headline</label>
          <input id="headline" name="headline" defaultValue={p.headline ?? ""} placeholder="A short line about you" maxLength={140} />
        </div>
      </div>

      {/* Community & location */}
      <h2 style={{ fontSize: 26, marginTop: 26 }}>Community and location</h2>
      <div className="grid grid-2" style={{ marginTop: 12 }}>
        <div>
          <label htmlFor="religion">Religion</label>
          <select id="religion" name="religion" defaultValue={p.religion ?? ""}>
            <option value="">Select</option>
            {RELIGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <label htmlFor="community">Community / caste</label>
          <input id="community" name="community" defaultValue={p.community ?? ""} placeholder="Optional" />
        </div>
        <div>
          <label htmlFor="city">City *</label>
          <input id="city" name="city" defaultValue={p.city ?? ""} placeholder="Your city" required />
          <label htmlFor="state">State</label>
          <input id="state" name="state" defaultValue={p.state ?? ""} placeholder="Optional" />
          <label htmlFor="country">Country</label>
          <input id="country" name="country" defaultValue={p.country ?? "India"} />
        </div>
      </div>

      {/* Education & career */}
      <h2 style={{ fontSize: 26, marginTop: 26 }}>Education and career</h2>
      <div className="grid grid-2" style={{ marginTop: 12 }}>
        <div>
          <label htmlFor="education">Highest education</label>
          <select id="education" name="education" defaultValue={p.education ?? ""}>
            <option value="">Select</option>
            {EDUCATION_LEVELS.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
          <label htmlFor="education_field">Field of study</label>
          <input id="education_field" name="education_field" defaultValue={p.education_field ?? ""} placeholder="e.g. Computer Science" />
        </div>
        <div>
          <label htmlFor="profession">Profession</label>
          <input id="profession" name="profession" defaultValue={p.profession ?? ""} placeholder="e.g. Software Engineer" />
          <label htmlFor="employer">Employer</label>
          <input id="employer" name="employer" defaultValue={p.employer ?? ""} placeholder="Optional" />
          <label htmlFor="annual_income">Annual income (INR / year)</label>
          <input id="annual_income" name="annual_income" type="number" min={0} step={50000} defaultValue={p.annual_income ?? ""} placeholder="e.g. 1200000" />
        </div>
      </div>

      {/* Lifestyle */}
      <h2 style={{ fontSize: 26, marginTop: 26 }}>Lifestyle</h2>
      <div className="grid grid-3" style={{ marginTop: 12 }}>
        <div>
          <label htmlFor="diet">Diet</label>
          <select id="diet" name="diet" defaultValue={p.diet ?? ""}>
            <option value="">Select</option>
            {DIETS.map((d) => (
              <option key={d} value={d}>
                {DIET_LABELS[d]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="smoking">Smoking</label>
          <select id="smoking" name="smoking" defaultValue={p.smoking ?? ""}>
            <option value="">Select</option>
            {HABITS.map((h) => (
              <option key={h} value={h}>
                {HABIT_LABELS[h]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="drinking">Drinking</label>
          <select id="drinking" name="drinking" defaultValue={p.drinking ?? ""}>
            <option value="">Select</option>
            {HABITS.map((h) => (
              <option key={h} value={h}>
                {HABIT_LABELS[h]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* About */}
      <h2 style={{ fontSize: 26, marginTop: 26 }}>About you</h2>
      <label htmlFor="about">About</label>
      <textarea id="about" name="about" rows={4} defaultValue={p.about ?? ""} placeholder="Tell prospective matches about yourself" />
      <label htmlFor="family_details">Family details</label>
      <textarea id="family_details" name="family_details" rows={3} defaultValue={p.family_details ?? ""} placeholder="About your family" />

      {/* Partner preferences */}
      <h2 style={{ fontSize: 26, marginTop: 26 }}>Partner preferences</h2>
      <div className="grid grid-2" style={{ marginTop: 12 }}>
        <div>
          <label htmlFor="pref_gender">Looking for</label>
          <select id="pref_gender" name="pref_gender" defaultValue={p.pref_gender ?? ""}>
            <option value="">Any</option>
            {GENDERS.map((g) => (
              <option key={g} value={g}>
                {GENDER_LABELS[g]}
              </option>
            ))}
          </select>
          <div className="row">
            <div style={{ flex: 1 }}>
              <label htmlFor="pref_age_min">Age from</label>
              <input id="pref_age_min" name="pref_age_min" type="number" min={18} max={100} defaultValue={p.pref_age_min ?? ""} />
            </div>
            <div style={{ flex: 1 }}>
              <label htmlFor="pref_age_max">Age to</label>
              <input id="pref_age_max" name="pref_age_max" type="number" min={18} max={100} defaultValue={p.pref_age_max ?? ""} />
            </div>
          </div>
          <label htmlFor="pref_religion">Preferred religion</label>
          <select id="pref_religion" name="pref_religion" defaultValue={p.pref_religion ?? ""}>
            <option value="">Any</option>
            {RELIGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <label htmlFor="pref_diet">Preferred diet</label>
          <select id="pref_diet" name="pref_diet" defaultValue={p.pref_diet ?? ""}>
            <option value="">Any</option>
            {DIETS.map((d) => (
              <option key={d} value={d}>
                {DIET_LABELS[d]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="pref_education">Preferred education</label>
          <select id="pref_education" name="pref_education" defaultValue={p.pref_education ?? ""}>
            <option value="">Any</option>
            {EDUCATION_LEVELS.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
          <label htmlFor="pref_location">Preferred location</label>
          <input id="pref_location" name="pref_location" defaultValue={p.pref_location ?? ""} placeholder="e.g. Mumbai, Pune" />
          <label htmlFor="pref_community">Preferred community</label>
          <input id="pref_community" name="pref_community" defaultValue={p.pref_community ?? ""} placeholder="Optional" />
          <label htmlFor="pref_notes">Anything else</label>
          <textarea id="pref_notes" name="pref_notes" rows={3} defaultValue={p.pref_notes ?? ""} placeholder="Other preferences" />
        </div>
      </div>

      <label className="agree" style={{ marginTop: 18 }}>
        <input type="checkbox" name="is_published" defaultChecked={Boolean(p.is_published)} />
        <span>
          Publish my profile so it appears in search and prospective matches can find me. You can
          unpublish any time.
        </span>
      </label>

      {state.error && <div className="alert alert-error">{state.error}</div>}
      {state.ok && <div className="alert alert-ok">{state.ok}</div>}

      <div style={{ marginTop: 16 }}>
        <SaveButton />
      </div>
    </form>
  );
}

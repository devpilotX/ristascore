"use client";

import { useFormState, useFormStatus } from "react-dom";
import { runVerificationAction } from "@/app/actions/dashboard";
import { CHECK_TYPES, CHECK_LABELS } from "@/lib/checks";
import { CheckIcons } from "@/components/icons";

function RunButton() {
  const { pending } = useFormStatus();
  return (
    <button className="btn" style={{ marginTop: 18 }} type="submit" disabled={pending}>
      {pending ? "Running checks..." : "Run verification"}
    </button>
  );
}

export function VerificationForm() {
  const [state, action] = useFormState(runVerificationAction, {});
  return (
    <form className="card" action={action}>
      <h2 style={{ fontSize: 30 }}>Give your consent</h2>
      <p className="muted" style={{ marginTop: 4 }}>
        Pick the checks you allow. Nothing runs without your clear permission. Fill in the
        details so the providers have something to verify.
      </p>

      <div className="checks" style={{ marginTop: 16 }}>
        {CHECK_TYPES.map((c) => (
          <label className="check-opt" key={c}>
            <input type="checkbox" name={`check_${c}`} defaultChecked={c !== "criminal_record"} />
            {CheckIcons[c]}
            <span>{CHECK_LABELS[c]}</span>
          </label>
        ))}
      </div>

      <div className="grid grid-2" style={{ marginTop: 18 }}>
        <div>
          <label htmlFor="full_name">Full name</label>
          <input id="full_name" name="full_name" placeholder="As per your ID" />
          <label htmlFor="id_number">Government ID number</label>
          <input id="id_number" name="id_number" placeholder="Only the last 4 digits are kept" />
          <label htmlFor="employer_name">Employer name</label>
          <input id="employer_name" name="employer_name" placeholder="Company name" />
          <label htmlFor="monthly_income">Monthly income</label>
          <input id="monthly_income" name="monthly_income" placeholder="For example 80000" />
        </div>
        <div>
          <label htmlFor="highest_qualification">Highest qualification</label>
          <input id="highest_qualification" name="highest_qualification" placeholder="For example B.Tech" />
          <label htmlFor="institution">Institution</label>
          <input id="institution" name="institution" placeholder="College or university" />
          <label htmlFor="marital_status">Marital status</label>
          <select id="marital_status" name="marital_status" defaultValue="never_married">
            <option value="never_married">Never married</option>
            <option value="divorced">Divorced</option>
            <option value="widowed">Widowed</option>
          </select>
          <label htmlFor="city">City</label>
          <input id="city" name="city" placeholder="Your city" />
        </div>
      </div>

      <label className="agree">
        <input type="checkbox" name="i_agree" />
        <span>
          I clearly and freely consent to the selected background checks, for the purpose of
          making a marriage trust badge. I understand this is purpose bound and I can take it back
          any time.
        </span>
      </label>

      {state.error && <div className="alert alert-error">{state.error}</div>}
      {state.ok && <div className="alert alert-ok">{state.ok}</div>}

      <RunButton />
    </form>
  );
}

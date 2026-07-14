"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { registerAction } from "@/app/actions/auth";
import { Ornament } from "@/components/icons";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button className="btn" style={{ marginTop: 18, width: "100%" }} type="submit" disabled={pending}>
      {pending ? "Creating your account..." : "Create account"}
    </button>
  );
}

export default function RegisterPage() {
  const [state, action] = useFormState(registerAction, {});
  return (
    <div className="wrap" style={{ paddingTop: 40, paddingBottom: 30 }}>
      <div className="center" style={{ margin: "6px 0 24px" }}>
        <div className="flourish">{Ornament}</div>
        <span className="eyebrow">Welcome</span>
        <h2 style={{ fontSize: 36, marginTop: 8 }}>Create your account</h2>
      </div>
      <form className="card card-cream" style={{ maxWidth: 460, margin: "0 auto" }} action={action}>
        <label htmlFor="full_name">Full name</label>
        <input id="full_name" name="full_name" placeholder="Your name" required />
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" placeholder="you@example.com" required />
        <label htmlFor="phone">Phone</label>
        <input id="phone" name="phone" placeholder="Optional" />
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" placeholder="At least 8 characters" required />
        {state.error && <div className="alert alert-error">{state.error}</div>}
        <SubmitButton />
        <p className="small muted center" style={{ marginTop: 14 }}>
          Already registered? <Link href="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}

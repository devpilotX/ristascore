"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { loginAction } from "@/app/actions/auth";
import { Ornament } from "@/components/icons";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button className="btn" style={{ marginTop: 18, width: "100%" }} type="submit" disabled={pending}>
      {pending ? "Signing you in..." : "Log in"}
    </button>
  );
}

export default function LoginPage() {
  const [state, action] = useFormState(loginAction, {});
  return (
    <div className="wrap" style={{ paddingTop: 40, paddingBottom: 30 }}>
      <div className="center" style={{ margin: "6px 0 24px" }}>
        <div className="flourish">{Ornament}</div>
        <span className="eyebrow">Welcome back</span>
        <h2 style={{ fontSize: 36, marginTop: 8 }}>Log in to your account</h2>
      </div>
      <form className="card card-cream" style={{ maxWidth: 460, margin: "0 auto" }} action={action}>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" placeholder="you@example.com" required />
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" placeholder="Your password" required />
        {state.error && <div className="alert alert-error">{state.error}</div>}
        <SubmitButton />
        <p className="small muted center" style={{ marginTop: 14 }}>
          New here? <Link href="/register">Create an account</Link>
        </p>
      </form>
    </div>
  );
}

import Link from "next/link";
import { Logo } from "./icons";

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div style={{ maxWidth: 300 }}>
          <div className="fbrand">
            <Logo light /> RishtaScore
          </div>
          <div style={{ opacity: 0.85 }}>
            Find and verify your life partner with confidence. Consent first, revocable, and
            fully auditable.
          </div>
        </div>
        <div className="foot-cols">
          <div className="col">
            <h4>Product</h4>
            <Link href="/#how">How it works</Link>
            <Link href="/#checks">The checks</Link>
            <Link href="/#pricing">Pricing</Link>
            <Link href="/verify">Verify a match</Link>
          </div>
          <div className="col">
            <h4>Company</h4>
            <Link href="/">About us</Link>
            <Link href="/">Careers</Link>
            <Link href="/">Contact</Link>
          </div>
          <div className="col">
            <h4>Legal</h4>
            <Link href="/">Privacy policy</Link>
            <Link href="/">Terms of use</Link>
            <Link href="/">Consent policy</Link>
            <Link href="/">Grievance</Link>
          </div>
        </div>
      </div>
      <div className="foot-base">
        Demo uses mock verification providers. Outputs are not real verifications yet.
        Copyright 2026 RishtaScore.
      </div>
    </footer>
  );
}

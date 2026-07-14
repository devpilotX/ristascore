import Link from "next/link";
import { redirect } from "next/navigation";
import { CHECK_TYPES, CHECK_LABELS } from "@/lib/checks";
import { ScoreCircle } from "@/components/score-circle";
import { ScoreCalculator } from "@/components/score-calculator";
import {
  CheckIcons,
  BadgeIcon,
  VerifyIcon,
  ShieldIcon,
  SealIcon,
  TickGold,
  TickGreen,
  Cross,
  Ornament,
  Mandala,
  HeartLight,
  LockLight,
  ShareLight,
  RupeeLight,
} from "@/components/icons";

const GRADES: Array<[string, string, string]> = [
  ["A+", "750 to 900", "var(--green)"],
  ["A", "650 to 749", "var(--green)"],
  ["B+", "550 to 649", "var(--gold-dark)"],
  ["B", "450 to 549", "var(--gold-dark)"],
  ["C", "350 to 449", "var(--amber)"],
  ["D", "0 to 349", "var(--red)"],
];

const PLANS = [
  {
    name: "Essential",
    price: "999",
    pop: false,
    feats: [
      "One Trust Badge",
      "All 5 verified checks",
      "Score out of 900 with grade",
      "Shareable link and QR code",
      "Public verification page",
      "Valid for 6 months",
    ],
  },
  {
    name: "Complete",
    price: "1,999",
    pop: true,
    feats: [
      "Everything in Essential",
      "Valid for 12 months",
      "Priority verification",
      "Downloadable PDF report",
      "25 match verify credits",
      "Dispute resolution support",
    ],
  },
  {
    name: "Together",
    price: "2,999",
    pop: false,
    feats: [
      "Two badges, for you and your partner",
      "Everything in Complete",
      "Family sharing controls",
      "Unlimited match verify",
      "Dedicated concierge support",
      "Priority customer care",
    ],
  },
];

const CMP: Array<[string, string | boolean, string | boolean, string | boolean]> = [
  ["Cost", "\u20b925,000 to 45,000", "Free", "\u20b9999 once"],
  ["Turnaround", "2 to 4 weeks", "Instant", "Minutes"],
  ["Consent based", false, false, true],
  ["Shareable badge", false, false, true],
  ["Re verifiable anytime", false, false, true],
  ["Privacy controls", false, false, true],
  ["Tamper proof record", false, false, true],
];

const FAQ: Array<[string, string]> = [
  [
    "Is my data private and safe?",
    "Yes. RishtaScore is built consent first. Every check runs only after you give clear, time stamped permission, your information is kept safe, and you decide exactly what is shared. You can take back your consent any time, and every view of your badge is saved for you to see.",
  ],
  [
    "Do you store my ID documents?",
    "No. We never store raw identity numbers. After a check, we keep only a masked reference, such as the last four digits, in line with good privacy practice.",
  ],
  [
    "What does each check verify?",
    "There are five checks: Government ID, Employment and Income, Education, Marital Status, and Criminal Record. Each one is scored out of 180. Only facts that are truly confirmed earn points, never self declared claims.",
  ],
  [
    "How is the trust score worked out?",
    "Your score runs from 0 to 900, with up to 180 points for each verified check. Unverifiable or mismatched results add zero, so the badge shows only what is genuinely confirmed.",
  ],
  [
    "Can I take back my consent later?",
    "Yes, any time from your dashboard. Once you revoke consent, the linked badge stops working straight away and shows as no longer active.",
  ],
  [
    "Is the badge a guarantee about a person?",
    "No. The badge shows verified facts at a point in time. It is a tool to help you decide, not a promise. Marital status in particular is best effort and never absolute.",
  ],
  [
    "Are the checks live against government systems right now?",
    "We are onboarding official access to DigiLocker, EPFO, NAD, eCourts, and police sources. Live access needs approved accounts and licences, so until each source is connected its check runs in a clearly labelled sandbox. Sandbox results are simulated and never claim to be confirmed against a real record. You always see whether a check is sandbox or live.",
  ],
];

function cmpCell(v: string | boolean) {
  if (v === true) return TickGreen;
  if (v === false) return Cross;
  return <span>{v}</span>;
}

export default function LandingPage({
  searchParams,
}: {
  searchParams: { badge?: string };
}) {
  // The QR code points at /?badge=<token>. Send those visitors to the
  // public verify page with the token prefilled.
  if (searchParams.badge) {
    redirect(`/verify?token=${encodeURIComponent(searchParams.badge)}`);
  }

  return (
    <>
      <section className="hero">
        <div className="mandala m1">
          <Mandala />
        </div>
        <div className="mandala m2">
          <Mandala />
        </div>
        <div className="wrap">
          <div className="hero-grid">
            <div>
              <div className="eyebrow">Verified profiles for marriage</div>
              <h1>
                Find your life partner, with <span className="accent">proof</span>, not just
                promises.
              </h1>
              <p className="lead">
                Marriage is a lifetime choice, yet most families still trust claims that no one
                has checked. RishtaScore lets you and a possible partner agree to background
                checks, then share one trusted badge. More confidence, far less doubt.
              </p>
              <div className="hero-cta">
                <Link className="btn" href="/register">
                  Build my Trust Badge
                </Link>
                <Link className="btn btn-ghost" href="/verify">
                  Verify a match
                </Link>
              </div>
              <div className="trustbar">
                <div className="t">
                  <b>&#8377;999</b>
                  <span>vs &#8377;25,000 to &#8377;45,000 detective</span>
                </div>
                <div className="t">
                  <b>0 to 900</b>
                  <span>Trust score range</span>
                </div>
                <div className="t">
                  <b>100%</b>
                  <span>Consent based</span>
                </div>
                <div className="t">
                  <b>5</b>
                  <span>Verified checks</span>
                </div>
              </div>
            </div>
            <div className="hero-art">
              <div className="hero-card">
                <div className="pills" style={{ justifyContent: "center", marginBottom: 18 }}>
                  <span className="pill">Revocable</span>
                  <span className="pill">Auditable</span>
                  <span className="pill">Private</span>
                </div>
                <ScoreCircle score={760} grade="A+" max={900} animate />
                <p
                  className="serif"
                  style={{ fontSize: 24, color: "var(--maroon-dark)", margin: "18px 0 2px" }}
                >
                  Asha Rao
                </p>
                <p className="small muted" style={{ margin: 0 }}>
                  Sample Trust Badge, 4 of 5 checks verified
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="valuestrip">
        <div className="wrap">
          <div className="vrow">
            <div className="vitem">
              <div className="vic">{HeartLight}</div>
              <div>
                <b>Made for marriage</b>
                <span>Built for Indian families</span>
              </div>
            </div>
            <div className="vitem">
              <div className="vic">{LockLight}</div>
              <div>
                <b>Strong security</b>
                <span>Encrypted and consent first</span>
              </div>
            </div>
            <div className="vitem">
              <div className="vic">{ShareLight}</div>
              <div>
                <b>Portable badge</b>
                <span>One link, share anywhere</span>
              </div>
            </div>
            <div className="vitem">
              <div className="vic">{RupeeLight}</div>
              <div>
                <b>From just &#8377;999</b>
                <span>A fraction of a detective</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="block" style={{ padding: "30px 0" }}>
        <div className="wrap">
          <p className="center eyebrow" style={{ marginBottom: 16 }}>
            Verification sources we are integrating
          </p>
          <div className="sources">
            <span className="chip">{SealIcon} DigiLocker</span>
            <span className="chip">{SealIcon} EPFO</span>
            <span className="chip">{SealIcon} NAD</span>
            <span className="chip">{SealIcon} eCourts</span>
            <span className="chip">{SealIcon} State Police</span>
          </div>
          <p className="center muted small" style={{ marginTop: 14, maxWidth: 640, margin: "14px auto 0" }}>
            These are the official sources each check is built to use. Live access to government
            systems requires approved accounts and licences, which we are onboarding. Until a
            source is live, that check runs in a clearly labelled sandbox and never claims to be
            confirmed against a real record.
          </p>
        </div>
      </section>

      <section
        className="block"
        id="how"
        style={{ background: "var(--ivory)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}
      >
        <div className="wrap">
          <div className="sec-head">
            <div className="flourish">{Ornament}</div>
            <span className="eyebrow">Simple and respectful</span>
            <h2>How it works</h2>
            <p>
              You stay in control at every step. Nothing is checked, scored, or shared without
              your clear consent.
            </p>
          </div>
          <div className="grid grid-3">
            <div className="card">
              <div className="stepnum">1</div>
              <h3>Give your consent</h3>
              <p className="muted">
                Choose exactly which checks to run. Every consent is clear, time stamped, and you
                can take it back any time.
              </p>
            </div>
            <div className="card">
              <div className="stepnum">2</div>
              <h3>Get verified</h3>
              <p className="muted">
                Only the checks you allowed are run, and only confirmed facts earn points. Never
                self declared claims.
              </p>
            </div>
            <div className="card">
              <div className="stepnum">3</div>
              <h3>Share your badge</h3>
              <p className="muted">
                Get a portable link and QR code. A partner and their family can check it in
                seconds, and every view is saved for you.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="block" id="checks">
        <div className="wrap">
          <div className="sec-head">
            <div className="flourish">{Ornament}</div>
            <span className="eyebrow">What we verify</span>
            <h2>Five checks that matter</h2>
            <p>
              Each check is scored out of 180, backed by consented government and partner sources
              as integrations roll out.
            </p>
          </div>
          <div className="grid grid-3">
            {CHECK_TYPES.map((c) => (
              <div className="card check-card" key={c}>
                <div className="check-ic">{CheckIcons[c]}</div>
                <h3 style={{ fontSize: 24 }}>{CHECK_LABELS[c]}</h3>
                <p className="muted small">
                  Confirmed facts earn up to 180 points. Unverifiable or mismatched data adds
                  zero.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        className="block"
        id="scoring"
        style={{ background: "var(--ivory)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}
      >
        <div className="wrap">
          <div className="sec-head">
            <div className="flourish">{Ornament}</div>
            <span className="eyebrow">How scoring works</span>
            <h2>One clear score, from 0 to 900</h2>
            <p>
              Five checks, up to 180 points each. Your grade makes the result easy to read at a
              glance.
            </p>
          </div>
          <div className="gradebar">
            {GRADES.map((g) => (
              <div className="seg" style={{ background: g[2] }} key={g[0]}>
                <b>{g[0]}</b>
                <span>{g[1]}</span>
              </div>
            ))}
          </div>
          <ScoreCalculator />
        </div>
      </section>

      <section className="block">
        <div className="wrap">
          <div className="sec-head">
            <div className="flourish">{Ornament}</div>
            <span className="eyebrow">Why RishtaScore</span>
            <h2>A better way than the old ways</h2>
            <p>
              The old options are slow, costly, or simply not checked. RishtaScore is fast, low
              cost, and runs only with your consent.
            </p>
          </div>
          <table className="cmp">
            <thead>
              <tr>
                <th></th>
                <th>Private detective</th>
                <th>Self declared</th>
                <th className="vt">RishtaScore</th>
              </tr>
            </thead>
            <tbody>
              {CMP.map((r) => (
                <tr key={String(r[0])}>
                  <td>{r[0]}</td>
                  <td>{cmpCell(r[1])}</td>
                  <td>{cmpCell(r[2])}</td>
                  <td className="vt">{cmpCell(r[3])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section
        className="block"
        style={{ background: "var(--ivory)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}
      >
        <div className="wrap">
          <div className="sec-head">
            <div className="flourish">{Ornament}</div>
            <span className="eyebrow">Two ways to use it</span>
            <h2>For you, and for your match</h2>
          </div>
          <div className="grid grid-2">
            <div className="card">
              <div className="use-ic">{BadgeIcon}</div>
              <h3 style={{ fontSize: 24 }}>Show your own trust</h3>
              <p className="muted">
                Build a Trust Badge for your own profile and share it with possible matches and
                their families, so the right people take you seriously from the start.
              </p>
              <Link className="btn btn-sm" style={{ marginTop: 8 }} href="/register">
                Build my badge
              </Link>
            </div>
            <div className="card">
              <div className="use-ic">{VerifyIcon}</div>
              <h3 style={{ fontSize: 24 }}>Verify a possible partner</h3>
              <p className="muted">
                Got a badge from a possible life partner? Confirm their verified facts in seconds,
                with their consent, before two families say yes.
              </p>
              <Link className="btn btn-sm btn-ghost" style={{ marginTop: 8 }} href="/verify">
                Verify a match
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="block" id="pricing">
        <div className="wrap">
          <div className="sec-head">
            <div className="flourish">{Ornament}</div>
            <span className="eyebrow">Simple pricing</span>
            <h2>Pay once, share with confidence</h2>
            <p>No subscriptions, no surprises. One time plans for every stage of your search.</p>
          </div>
          <div className="price-grid">
            {PLANS.map((p) => (
              <div className={`price-card ${p.pop ? "pop" : ""}`} key={p.name}>
                {p.pop && <div className="ribbon">Most loved</div>}
                <h3>{p.name}</h3>
                <div className="price-amt">
                  &#8377;{p.price}
                  <small> once</small>
                </div>
                <p className="price-note">One time payment, no auto renewal</p>
                <ul>
                  {p.feats.map((f) => (
                    <li key={f}>
                      {TickGold}
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link className={`btn ${p.pop ? "" : "btn-ghost"}`} href="/register">
                  Get started
                </Link>
              </div>
            ))}
          </div>
          <p className="center muted small" style={{ marginTop: 16 }}>
            All plans include consent controls, revocation, and audit logs. During launch,
            payments are not yet enabled and all features are free to use. Prices shown are
            indicative for when paid plans go live.
          </p>
        </div>
      </section>

      <section
        className="block"
        style={{ background: "var(--ivory)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}
      >
        <div className="wrap">
          <div className="trust-strip">
            <div className="ic">{ShieldIcon}</div>
            <div className="tx">
              <h3 style={{ fontSize: 26 }}>Privacy by design</h3>
              <p className="muted" style={{ margin: "6px 0 0" }}>
                Your consent comes first, always. Information is kept safe, raw ID numbers are
                never stored, every badge view is saved, and you can revoke access at any moment.
                Built to respect Indian data protection rules.
              </p>
            </div>
            <Link className="btn btn-sm" href="/register" style={{ flex: "none" }}>
              Get started
            </Link>
          </div>
        </div>
      </section>

      <section className="block">
        <div className="wrap">
          <div className="stats">
            <div className="s">
              <b>3</b>
              <span>Simple steps to your badge</span>
            </div>
            <div className="s">
              <b>180</b>
              <span>Points per verified check</span>
            </div>
            <div className="s">
              <b>12</b>
              <span>Months of badge validity</span>
            </div>
            <div className="s">
              <b>0</b>
              <span>Raw ID numbers stored</span>
            </div>
          </div>
        </div>
      </section>

      <section
        className="block"
        style={{ background: "var(--ivory)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}
      >
        <div className="wrap">
          <div className="sec-head">
            <div className="flourish">{Ornament}</div>
            <span className="eyebrow">Trusted by families</span>
            <h2>Peace of mind, the modern way</h2>
          </div>
          <div className="grid grid-3">
            <div className="quote">
              <p>
                We could finally move forward with confidence. The badge answered the questions no
                one likes to ask out loud.
              </p>
              <div className="qfoot">
                <span className="avatar">M</span>
                <div className="who">Meera and family, Pune</div>
              </div>
            </div>
            <div className="quote">
              <p>
                I controlled exactly what was shared with the other family. It felt respectful,
                never invasive.
              </p>
              <div className="qfoot">
                <span className="avatar gold">R</span>
                <div className="who">Rohan, Bengaluru</div>
              </div>
            </div>
            <div className="quote">
              <p>
                The verification was quick and the badge made introductions far easier for both
                families.
              </p>
              <div className="qfoot">
                <span className="avatar">S</span>
                <div className="who">Sneha and family, Jaipur</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="block" id="faq">
        <div className="wrap" style={{ maxWidth: 820 }}>
          <div className="sec-head">
            <div className="flourish">{Ornament}</div>
            <span className="eyebrow">Good to know</span>
            <h2>Frequently asked questions</h2>
          </div>
          <div className="faq">
            {FAQ.map((q, i) => (
              <details key={q[0]} open={i === 0}>
                <summary>{q[0]}</summary>
                <p>{q[1]}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

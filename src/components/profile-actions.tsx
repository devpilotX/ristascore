import Link from "next/link";
import {
  toggleShortlistAction,
  expressInterestAction,
  withdrawInterestAction,
} from "@/app/actions/matchmaking";

/**
 * Relationship-aware actions on a profile. Server component: each control is a
 * small form posting to a server action. No client JS needed.
 */
export function ProfileActions({
  targetId,
  shortlisted,
  sentInterest,
  incomingInterest,
  conversationId,
  signedIn,
}: {
  targetId: string;
  shortlisted: boolean;
  sentInterest: string | null;
  incomingInterest: string | null;
  conversationId: string | null;
  signedIn: boolean;
}) {
  if (!signedIn) {
    return (
      <div className="row" style={{ marginTop: 16 }}>
        <Link className="btn" href="/login">
          Log in to connect
        </Link>
      </div>
    );
  }

  const connected = sentInterest === "accepted" || incomingInterest === "accepted";

  return (
    <div style={{ marginTop: 16 }}>
      <div className="row">
        <form action={toggleShortlistAction}>
          <input type="hidden" name="target_id" value={targetId} />
          <button className={`btn btn-sm ${shortlisted ? "btn-gold" : "btn-ghost"}`} type="submit">
            {shortlisted ? "Saved \u2713" : "Shortlist"}
          </button>
        </form>

        {connected && conversationId && (
          <Link className="btn btn-sm" href={`/messages/${conversationId}`}>
            Message
          </Link>
        )}
      </div>

      <div style={{ marginTop: 12 }}>
        {connected ? (
          <span className="badge-status s-verified">Connected</span>
        ) : incomingInterest === "sent" ? (
          <p className="small">
            This person has expressed interest in you.{" "}
            <Link href="/matches">Respond in Matches</Link>.
          </p>
        ) : sentInterest === "sent" ? (
          <div className="row">
            <span className="badge-status s-pending">Interest sent</span>
            <form action={withdrawInterestAction}>
              <input type="hidden" name="target_id" value={targetId} />
              <button className="btn btn-sm btn-ghost" type="submit">
                Withdraw
              </button>
            </form>
          </div>
        ) : sentInterest === "declined" ? (
          <span className="badge-status s-mismatch">Interest declined</span>
        ) : (
          <form action={expressInterestAction} style={{ maxWidth: 460 }}>
            <input type="hidden" name="target_id" value={targetId} />
            <label htmlFor="message">Add a short note (optional)</label>
            <textarea id="message" name="message" rows={2} placeholder="Say hello and why you'd like to connect" />
            <button className="btn btn-sm" type="submit" style={{ marginTop: 8 }}>
              Express interest
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

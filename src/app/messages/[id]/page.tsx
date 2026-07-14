import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-helpers";
import { sendMessageAction } from "@/app/actions/matchmaking";

export const dynamic = "force-dynamic";

function fmt(d: Date) {
  return new Date(d).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function ConversationPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const convo = await db.conversation.findUnique({
    where: { id: params.id },
    include: {
      user_a: { select: { id: true, full_name: true } },
      user_b: { select: { id: true, full_name: true } },
      messages: { orderBy: { created_at: "asc" } },
    },
  });

  if (!convo) notFound();
  if (convo.user_a_id !== user.id && convo.user_b_id !== user.id) notFound();

  const other = convo.user_a_id === user.id ? convo.user_b : convo.user_a;

  // Mark the other person's messages as read.
  await db.message.updateMany({
    where: { conversation_id: convo.id, sender_id: other.id, read_at: null },
    data: { read_at: new Date() },
  });

  return (
    <div className="wrap" style={{ paddingTop: 24, paddingBottom: 30, maxWidth: 760 }}>
      <Link className="small muted" href="/messages">
        &larr; All messages
      </Link>

      <div className="card" style={{ marginTop: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid var(--line)", paddingBottom: 14 }}>
          <span className="avatar">{other.full_name.slice(0, 1)}</span>
          <div>
            <b style={{ color: "var(--maroon-dark)", fontSize: 18 }}>{other.full_name}</b>
            <p className="small muted" style={{ margin: 0 }}>
              <Link href={`/u/${other.id}`}>View profile</Link>
            </p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "16px 0", minHeight: 200 }}>
          {convo.messages.length === 0 && (
            <p className="muted small center">No messages yet. Send the first one below.</p>
          )}
          {convo.messages.map((m) => {
            const mine = m.sender_id === user.id;
            return (
              <div
                key={m.id}
                style={{
                  alignSelf: mine ? "flex-end" : "flex-start",
                  maxWidth: "78%",
                  background: mine ? "linear-gradient(135deg, var(--maroon), var(--maroon-dark))" : "var(--ivory)",
                  color: mine ? "#fff" : "var(--ink)",
                  border: mine ? "none" : "1px solid var(--line)",
                  borderRadius: 14,
                  padding: "10px 14px",
                }}
              >
                <p style={{ margin: 0, fontSize: 14.5 }}>{m.body}</p>
                <span style={{ fontSize: 11, opacity: 0.7 }}>{fmt(m.created_at)}</span>
              </div>
            );
          })}
        </div>

        <form action={sendMessageAction} className="row" style={{ borderTop: "1px solid var(--line)", paddingTop: 14 }}>
          <input type="hidden" name="conversation_id" value={convo.id} />
          <input name="body" placeholder="Write a message..." required maxLength={2000} style={{ flex: 1 }} />
          <button className="btn" type="submit">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

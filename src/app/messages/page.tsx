import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-helpers";
import { Ornament } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const conversations = await db.conversation.findMany({
    where: { OR: [{ user_a_id: user.id }, { user_b_id: user.id }] },
    orderBy: { updated_at: "desc" },
    include: {
      user_a: { select: { id: true, full_name: true } },
      user_b: { select: { id: true, full_name: true } },
      messages: { orderBy: { created_at: "desc" }, take: 1 },
    },
  });

  return (
    <div className="wrap" style={{ paddingTop: 28, paddingBottom: 30 }}>
      <div className="center" style={{ margin: "4px 0 18px" }}>
        <div className="flourish">{Ornament}</div>
        <span className="eyebrow">Conversations</span>
        <h2 style={{ fontSize: 34, marginTop: 8 }}>Messages</h2>
        <p className="muted">You can message someone once you have both accepted interest.</p>
      </div>

      {conversations.length === 0 ? (
        <div className="card center">
          <h3 style={{ fontSize: 22 }}>No conversations yet</h3>
          <p className="muted">
            Connect with someone from <Link href="/matches">Matches</Link> to start chatting.
          </p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          {conversations.map((c) => {
            const other = c.user_a_id === user.id ? c.user_b : c.user_a;
            const last = c.messages[0];
            return (
              <Link
                key={c.id}
                href={`/messages/${c.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "16px 20px",
                  borderBottom: "1px solid var(--line)",
                  color: "inherit",
                }}
              >
                <span className="avatar">{other.full_name.slice(0, 1)}</span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <b style={{ color: "var(--maroon-dark)" }}>{other.full_name}</b>
                  <p className="small muted" style={{ margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {last ? `${last.sender_id === user.id ? "You: " : ""}${last.body}` : "Say hello"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

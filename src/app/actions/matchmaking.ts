"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth-helpers";

/** Order a user pair deterministically so a conversation is unique. */
function pair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

/** True when the two users have an accepted interest in either direction. */
async function areConnected(u1: string, u2: string): Promise<boolean> {
  const i = await db.interest.findFirst({
    where: {
      status: "accepted",
      OR: [
        { from_user_id: u1, to_user_id: u2 },
        { from_user_id: u2, to_user_id: u1 },
      ],
    },
    select: { id: true },
  });
  return Boolean(i);
}

async function getOrCreateConversation(u1: string, u2: string): Promise<string> {
  const [a, b] = pair(u1, u2);
  const convo = await db.conversation.upsert({
    where: { user_a_id_user_b_id: { user_a_id: a, user_b_id: b } },
    create: { user_a_id: a, user_b_id: b },
    update: {},
    select: { id: true },
  });
  return convo.id;
}

export async function toggleShortlistAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const targetId = String(formData.get("target_id") || "");
  if (!targetId || targetId === user.id) return;

  const target = await db.profile.findFirst({
    where: { user_id: targetId, is_published: true },
    select: { user_id: true },
  });
  if (!target) return;

  const existing = await db.shortlist.findUnique({
    where: { owner_id_target_id: { owner_id: user.id, target_id: targetId } },
  });
  if (existing) {
    await db.shortlist.delete({ where: { id: existing.id } });
  } else {
    await db.shortlist.create({ data: { owner_id: user.id, target_id: targetId } });
  }
  revalidatePath(`/u/${targetId}`);
  revalidatePath("/matches");
}

export async function expressInterestAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const targetId = String(formData.get("target_id") || "");
  const message = String(formData.get("message") || "").trim().slice(0, 500) || null;
  if (!targetId || targetId === user.id) return;

  // Only allow interest in a real, published profile.
  const target = await db.profile.findFirst({
    where: { user_id: targetId, is_published: true },
    select: { user_id: true },
  });
  if (!target) return;

  // Re-sending after a withdrawal/decline resets the interest to "sent".
  await db.interest.upsert({
    where: { from_user_id_to_user_id: { from_user_id: user.id, to_user_id: targetId } },
    create: { from_user_id: user.id, to_user_id: targetId, message, status: "sent" },
    update: { status: "sent", message },
  });
  revalidatePath(`/u/${targetId}`);
  revalidatePath("/matches");
}

export async function withdrawInterestAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const targetId = String(formData.get("target_id") || "");
  if (!targetId) return;
  await db.interest.updateMany({
    where: { from_user_id: user.id, to_user_id: targetId, status: "sent" },
    data: { status: "withdrawn" },
  });
  revalidatePath(`/u/${targetId}`);
  revalidatePath("/matches");
}

export async function respondInterestAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const interestId = String(formData.get("interest_id") || "");
  const decision = String(formData.get("decision") || "");
  if (!interestId || !["accept", "decline"].includes(decision)) return;

  const interest = await db.interest.findUnique({ where: { id: interestId } });
  // Only the recipient can respond, and only to a pending interest.
  if (!interest || interest.to_user_id !== user.id || interest.status !== "sent") return;

  if (decision === "accept") {
    await db.interest.update({ where: { id: interestId }, data: { status: "accepted" } });
    await getOrCreateConversation(interest.from_user_id, interest.to_user_id);
  } else {
    await db.interest.update({ where: { id: interestId }, data: { status: "declined" } });
  }
  revalidatePath("/matches");
  revalidatePath("/messages");
}

export async function sendMessageAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const conversationId = String(formData.get("conversation_id") || "");
  const body = String(formData.get("body") || "").trim();
  if (!conversationId || !body) return;

  const convo = await db.conversation.findUnique({ where: { id: conversationId } });
  if (!convo) return;
  // Membership check.
  if (convo.user_a_id !== user.id && convo.user_b_id !== user.id) return;
  // Must still be connected (accepted interest) to exchange messages.
  const other = convo.user_a_id === user.id ? convo.user_b_id : convo.user_a_id;
  if (!(await areConnected(user.id, other))) return;

  await db.$transaction([
    db.message.create({
      data: { conversation_id: conversationId, sender_id: user.id, body: body.slice(0, 2000) },
    }),
    db.conversation.update({ where: { id: conversationId }, data: { updated_at: new Date() } }),
  ]);
  revalidatePath(`/messages/${conversationId}`);
  redirect(`/messages/${conversationId}`);
}

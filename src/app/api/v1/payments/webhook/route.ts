import { NextRequest } from "next/server";
import { getPaymentAdapter } from "@/lib/adapters/payment";
import { logger } from "@/lib/logger";

// POST /api/v1/payments/webhook
// Razorpay calls this. We verify the signature before trusting the event.
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature") || "";

  const adapter = getPaymentAdapter();
  const valid = adapter.verifyWebhookSignature(rawBody, signature);

  if (!valid) {
    logger.warn("Rejected a payment webhook with an invalid signature");
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    const event = JSON.parse(rawBody) as { event?: string };
    logger.info({ event: event.event }, "Payment webhook received");
    // Real implementation: mark the order paid and unlock plan features here.
    return Response.json({ ok: true });
  } catch {
    return new Response("Bad payload", { status: 400 });
  }
}

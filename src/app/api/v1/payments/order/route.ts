import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth-helpers";
import { ok, fail, handleError } from "@/lib/api";
import { getPaymentProvider, PLANS } from "@/lib/adapters/payment";

// POST /api/v1/payments/order  { plan_id }
// Creates an order with the active payment provider. When payments are
// disabled (the default) this returns a clear disabled response.
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = (await req.json()) as { plan_id?: string };
    const plan = PLANS.find((p) => p.id === body.plan_id);
    if (!plan) return fail("Unknown plan", 400);

    const provider = getPaymentProvider();
    if (!provider.enabled) {
      return ok({
        enabled: false,
        message:
          "Payments are not enabled yet. All core features are currently free during launch.",
        plan: { id: plan.id, name: plan.name, amount: plan.amount },
      });
    }

    const order = await provider.createOrder(plan.amount, `rcpt_${user.id}_${Date.now()}`);

    return ok({
      enabled: true,
      order,
      plan: { id: plan.id, name: plan.name, amount: plan.amount },
      provider: provider.name,
      key_id: provider.name === "razorpay" ? process.env.RAZORPAY_KEY_ID || null : null,
    });
  } catch (err) {
    return handleError(err);
  }
}

/**
 * Payment provider abstraction.
 *
 * Payments are OFF by default (PAYMENTS_ENABLED=false). Every core feature of
 * RishtaScore works without payments. When you switch payments on, a provider
 * is selected by PAYMENT_PROVIDER (or auto-detected from whichever credentials
 * are present):
 *
 *   - "razorpay": fully implemented (orders + webhook signature check).
 *   - "paypal":  scaffolded and ready. Drop in the REST client where marked,
 *                set the PayPal env vars, and flip PAYMENT_PROVIDER=paypal.
 *
 * When disabled, createOrder returns an honest disabled order rather than a
 * fake "paid" state, so nothing ever pretends money changed hands.
 */

import { createHmac } from "node:crypto";
import { env } from "../env";
import { logger } from "../logger";

export interface PaymentOrder {
  id: string;
  amount: number;
  currency: string;
  provider: string;
  /** True when no real payment gateway processed this (disabled or stub). */
  stub: boolean;
}

export interface PaymentProvider {
  readonly name: string;
  readonly enabled: boolean;
  createOrder(amountInPaise: number, receipt: string): Promise<PaymentOrder>;
  verifyWebhookSignature(rawBody: string, signature: string): boolean;
}

/** Payments turned off. Returns a clearly disabled order; verifies nothing. */
class DisabledPaymentProvider implements PaymentProvider {
  readonly name = "disabled";
  readonly enabled = false;
  async createOrder(amountInPaise: number): Promise<PaymentOrder> {
    return {
      id: `order_disabled_${Date.now()}`,
      amount: amountInPaise,
      currency: "INR",
      provider: this.name,
      stub: true,
    };
  }
  verifyWebhookSignature(): boolean {
    // Never trust a webhook when payments are disabled.
    return false;
  }
}

class RazorpayProvider implements PaymentProvider {
  readonly name = "razorpay";
  readonly enabled = true;
  async createOrder(amountInPaise: number, receipt: string): Promise<PaymentOrder> {
    const auth = Buffer.from(`${env.razorpay.keyId}:${env.razorpay.keySecret}`).toString("base64");
    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
      body: JSON.stringify({ amount: amountInPaise, currency: "INR", receipt }),
    });
    if (!res.ok) throw new Error(`Razorpay order failed: ${res.status}`);
    const data = (await res.json()) as { id: string; amount: number; currency: string };
    return { id: data.id, amount: data.amount, currency: data.currency, provider: this.name, stub: false };
  }
  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    if (!env.razorpay.webhookSecret) return false;
    const expected = createHmac("sha256", env.razorpay.webhookSecret).update(rawBody).digest("hex");
    return expected === signature;
  }
}

/**
 * PayPal provider. Scaffolded for the planned integration. Until the REST
 * client is implemented it throws clearly rather than faking an order, so it
 * can never be mistaken for a working payment.
 */
class PayPalProvider implements PaymentProvider {
  readonly name = "paypal";
  readonly enabled = true;
  async createOrder(amountInPaise: number, _receipt: string): Promise<PaymentOrder> {
    // TODO: POST https://api-m{.sandbox}.paypal.com/v2/checkout/orders with an
    // OAuth token from env.paypal.clientId/clientSecret. Convert INR paise to
    // the configured presentment currency. Return the PayPal order id.
    void amountInPaise;
    throw new Error("PayPal integration is not implemented yet");
  }
  verifyWebhookSignature(): boolean {
    // TODO: verify via PayPal's /v1/notifications/verify-webhook-signature
    // using env.paypal.webhookId. Until then, reject.
    return false;
  }
}

/** Resolve the active payment provider, honouring the master switch. */
export function getPaymentProvider(): PaymentProvider {
  if (!env.paymentsEnabled) return new DisabledPaymentProvider();

  const choice = (process.env.PAYMENT_PROVIDER || "").toLowerCase();
  if (choice === "paypal" || (!choice && env.paypal.clientId && env.paypal.clientSecret)) {
    return new PayPalProvider();
  }
  if (choice === "razorpay" || (!choice && env.razorpay.keyId && env.razorpay.keySecret)) {
    return new RazorpayProvider();
  }

  logger.warn("PAYMENTS_ENABLED is true but no provider is configured; payments stay disabled");
  return new DisabledPaymentProvider();
}

/** Backwards-compatible alias used by existing routes. */
export const getPaymentAdapter = getPaymentProvider;

/** Plans, prices in paise (INR). Mirrors the pricing section in the UI. */
export const PLANS = [
  { id: "essential", name: "Essential", amount: 99900 },
  { id: "complete", name: "Complete", amount: 199900 },
  { id: "together", name: "Together", amount: 299900 },
] as const;

/**
 * Email adapter.
 *
 * Uses Resend when RESEND_API_KEY is set, otherwise logs to the console so
 * the app works locally with no account. Same interface either way.
 */

import { env } from "../env";
import { logger } from "../logger";

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
}

export interface EmailAdapter {
  readonly name: string;
  send(message: EmailMessage): Promise<{ ok: boolean; id?: string }>;
}

class ConsoleEmailAdapter implements EmailAdapter {
  readonly name = "console";
  async send(message: EmailMessage) {
    logger.info({ to: "[redacted]", subject: message.subject }, "Email (console adapter)");
    return { ok: true, id: `console_${Date.now()}` };
  }
}

class ResendEmailAdapter implements EmailAdapter {
  readonly name = "resend";
  async send(message: EmailMessage) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.resend.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.resend.from,
        to: message.to,
        subject: message.subject,
        html: message.html,
      }),
    });
    if (!res.ok) {
      logger.error({ status: res.status }, "Resend send failed");
      return { ok: false };
    }
    const data = (await res.json()) as { id?: string };
    return { ok: true, id: data.id };
  }
}

export function getEmailAdapter(): EmailAdapter {
  return env.resend.apiKey ? new ResendEmailAdapter() : new ConsoleEmailAdapter();
}

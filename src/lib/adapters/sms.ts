/**
 * SMS adapter.
 *
 * Picks MSG91 or Twilio based on SMS_PROVIDER. Falls back to a console
 * adapter when no provider is configured, so OTP and alerts work locally.
 */

import { env } from "../env";
import { logger } from "../logger";

export interface SmsMessage {
  to: string;
  body: string;
}

export interface SmsAdapter {
  readonly name: string;
  send(message: SmsMessage): Promise<{ ok: boolean }>;
}

class ConsoleSmsAdapter implements SmsAdapter {
  readonly name = "console";
  async send(message: SmsMessage) {
    logger.info({ to: "[redacted]", length: message.body.length }, "SMS (console adapter)");
    return { ok: true };
  }
}

class Msg91Adapter implements SmsAdapter {
  readonly name = "msg91";
  async send(message: SmsMessage) {
    const res = await fetch("https://api.msg91.com/api/v5/flow/", {
      method: "POST",
      headers: { authkey: env.sms.msg91Key, "Content-Type": "application/json" },
      body: JSON.stringify({ mobiles: message.to, message: message.body }),
    });
    return { ok: res.ok };
  }
}

class TwilioAdapter implements SmsAdapter {
  readonly name = "twilio";
  async send(message: SmsMessage) {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${env.sms.twilioSid}/Messages.json`;
    const body = new URLSearchParams({
      To: message.to,
      From: env.sms.twilioFrom,
      Body: message.body,
    });
    const auth = Buffer.from(`${env.sms.twilioSid}:${env.sms.twilioToken}`).toString("base64");
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });
    return { ok: res.ok };
  }
}

export function getSmsAdapter(): SmsAdapter {
  if (env.sms.provider === "msg91" && env.sms.msg91Key) return new Msg91Adapter();
  if (env.sms.provider === "twilio" && env.sms.twilioSid) return new TwilioAdapter();
  return new ConsoleSmsAdapter();
}

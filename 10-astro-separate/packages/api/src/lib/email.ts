import { Resend } from "resend";
import { config } from "./config.js";

const resend = () => (config.resendApiKey() ? new Resend(config.resendApiKey()) : null);

export async function sendTransactionalEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const client = resend();
  if (!client) {
    return { ok: false, skipped: true, error: "RESEND_API_KEY not set" };
  }
  try {
    await client.emails.send({
      from: config.resendFrom(),
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "send failed";
    return { ok: false, error: message };
  }
}

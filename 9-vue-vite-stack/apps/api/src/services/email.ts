import { Resend } from "resend";
import type { Env } from "../lib/env.js";

export async function sendTransactionalEmail(
  env: Env,
  opts: { to: string; subject: string; html: string }
): Promise<void> {
  if (!env.RESEND_API_KEY) {
    console.info("[email skipped]", opts.to, opts.subject);
    return;
  }
  const resend = new Resend(env.RESEND_API_KEY);
  const from = env.EMAIL_FROM ?? "Platform <onboarding@resend.dev>";
  await resend.emails.send({
    from,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  });
}

export function verificationLink(webOrigin: string, token: string) {
  return `${webOrigin}/verify-email?token=${encodeURIComponent(token)}`;
}

export function resetLink(webOrigin: string, token: string) {
  return `${webOrigin}/reset-password?token=${encodeURIComponent(token)}`;
}

import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function sendPasswordResetEmail(to: string, url: string) {
  if (!resend || !process.env.EMAIL_FROM) {
    console.info("[email:stub] password reset", { to, url });
    return { ok: false as const, reason: "not_configured" };
  }
  await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Reset your password",
    html: `<p>Click <a href="${url}">here</a> to reset your password.</p>`,
  });
  return { ok: true as const };
}

export async function sendVerificationEmail(to: string, url: string) {
  if (!resend || !process.env.EMAIL_FROM) {
    console.info("[email:stub] verify email", { to, url });
    return { ok: false as const, reason: "not_configured" };
  }
  await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Verify your email",
    html: `<p>Confirm your address: <a href="${url}">Verify</a></p>`,
  });
  return { ok: true as const };
}

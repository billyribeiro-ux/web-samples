import { Resend } from "resend";
import type { Env } from "../config.js";

export function createMailer(env: Env) {
  const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

  return {
    async sendVerification(to: string, link: string) {
      if (!resend) {
        console.info("[email:stub] verify", to, link);
        return;
      }
      await resend.emails.send({
        from: env.EMAIL_FROM,
        to,
        subject: "Verify your email",
        html: `<p><a href="${link}">Verify email</a></p>`,
      });
    },
    async sendPasswordReset(to: string, link: string) {
      if (!resend) {
        console.info("[email:stub] reset", to, link);
        return;
      }
      await resend.emails.send({
        from: env.EMAIL_FROM,
        to,
        subject: "Reset your password",
        html: `<p><a href="${link}">Reset password</a></p>`,
      });
    },
    async sendOrderReceipt(to: string, orderId: string) {
      if (!resend) {
        console.info("[email:stub] order", to, orderId);
        return;
      }
      await resend.emails.send({
        from: env.EMAIL_FROM,
        to,
        subject: "Order confirmation",
        html: `<p>Order ${orderId} confirmed.</p>`,
      });
    },
  };
}

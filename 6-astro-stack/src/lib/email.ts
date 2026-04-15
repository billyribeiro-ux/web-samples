import { Resend } from 'resend';

const from = process.env.EMAIL_FROM ?? 'Astro Business <onboarding@resend.dev>';

export async function sendEmail(opts: { to: string; subject: string; html: string }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    if (process.env.NODE_ENV === 'development') {
      console.info('[email:dev]', opts.subject, '→', opts.to);
    }
    return { id: 'skipped' as const };
  }
  const resend = new Resend(key);
  const { data, error } = await resend.emails.send({
    from,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  });
  if (error) throw new Error(error.message);
  return data;
}

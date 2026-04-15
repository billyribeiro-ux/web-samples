import { Resend } from 'resend';
import { env as privateEnv } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';

type SendOpts = {
	to: string;
	subject: string;
	html: string;
	text?: string;
};

export async function sendEmail(opts: SendOpts): Promise<void> {
	const key = privateEnv.RESEND_API_KEY;
	const from = privateEnv.EMAIL_FROM ?? 'App <noreply@example.com>';

	if (!key) {
		console.info('[email:skipped]', opts.to, opts.subject);
		return;
	}

	const resend = new Resend(key);
	const { error } = await resend.emails.send({
		from,
		to: opts.to,
		subject: opts.subject,
		html: opts.html,
		text: opts.text
	});

	if (error) {
		console.error('[email:error]', error);
		throw new Error('Failed to send email');
	}
}

export function appOrigin(): string {
	const u = publicEnv.PUBLIC_APP_URL;
	return (u ?? 'http://localhost:5173').replace(/\/$/, '');
}

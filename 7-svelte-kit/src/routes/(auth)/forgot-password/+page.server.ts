import { fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { generateId } from 'lucia';
import { forgotPasswordSchema } from '$lib/schemas/auth';
import { appOrigin, sendEmail } from '$lib/server/email';
import { db } from '$lib/server/db';
import { passwordResetToken, user } from '$lib/server/db/schema';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request }) => {
		const fd = await request.formData();
		const parsed = forgotPasswordSchema.safeParse({ email: fd.get('email') });
		if (!parsed.success) {
			return fail(400, { message: 'Valid email required', ok: false });
		}

		const [row] = await db.select({ id: user.id }).from(user).where(eq(user.email, parsed.data.email)).limit(1);

		// Always same response to avoid account enumeration
		if (!row) {
			return { ok: true as const };
		}

		const id = generateId(40);
		const expiresAt = new Date(Date.now() + 1000 * 60 * 60);
		await db.insert(passwordResetToken).values({ id, userId: row.id, expiresAt });

		const link = `${appOrigin()}/reset-password?token=${encodeURIComponent(id)}`;
		await sendEmail({
			to: parsed.data.email,
			subject: 'Reset your password',
			html: `<p>Reset your password:</p><p><a href="${link}">${link}</a></p>`,
			text: link
		});

		return { ok: true as const };
	}
};

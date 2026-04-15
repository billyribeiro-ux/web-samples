import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { resetPasswordSchema } from '$lib/schemas/auth';
import { hashPassword } from '$lib/server/auth/password';
import { db } from '$lib/server/db';
import { passwordResetToken, user } from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const token = url.searchParams.get('token');
	return { token };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const fd = await request.formData();
		const parsed = resetPasswordSchema.safeParse({
			token: fd.get('token'),
			password: fd.get('password')
		});
		if (!parsed.success) {
			return fail(400, { message: 'Invalid input' });
		}

		const { token, password } = parsed.data;

		const [t] = await db
			.select()
			.from(passwordResetToken)
			.where(eq(passwordResetToken.id, token))
			.limit(1);

		if (!t || t.expiresAt < new Date()) {
			return fail(400, { message: 'Invalid or expired token' });
		}

		await db
			.update(user)
			.set({ hashedPassword: await hashPassword(password), updatedAt: new Date() })
			.where(eq(user.id, t.userId));

		await db.delete(passwordResetToken).where(eq(passwordResetToken.id, token));

		throw redirect(302, '/login');
	}
};

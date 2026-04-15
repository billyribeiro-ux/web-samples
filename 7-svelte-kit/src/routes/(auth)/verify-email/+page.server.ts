import { redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { emailVerificationToken, user } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals }) => {
	const token = url.searchParams.get('token');
	if (!token) throw redirect(302, '/login');

	const [t] = await db
		.select()
		.from(emailVerificationToken)
		.where(eq(emailVerificationToken.id, token))
		.limit(1);

	if (!t || t.expiresAt < new Date()) {
		throw redirect(302, '/login');
	}

	await db.update(user).set({ emailVerified: true, updatedAt: new Date() }).where(eq(user.id, t.userId));
	await db.delete(emailVerificationToken).where(eq(emailVerificationToken.id, token));

	if (locals.user?.id === t.userId) {
		throw redirect(302, '/account');
	}
	throw redirect(302, '/login');
};

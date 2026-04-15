import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { generateId } from 'lucia';
import { registerSchema } from '$lib/schemas/auth';
import { lucia } from '$lib/server/auth/lucia';
import { hashPassword } from '$lib/server/auth/password';
import { appOrigin, sendEmail } from '$lib/server/email';
import { db } from '$lib/server/db';
import { emailVerificationToken, user, userRole } from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) throw redirect(302, '/account');
	return {};
};

export const actions: Actions = {
	default: async ({ request, cookies, locals }) => {
		if (locals.user) throw redirect(302, '/account');

		const fd = await request.formData();
		const parsed = registerSchema.safeParse({
			email: fd.get('email'),
			password: fd.get('password'),
			name: fd.get('name')
		});

		if (!parsed.success) {
			const e = parsed.error.flatten();
			return fail(400, {
				message: e.fieldErrors.email?.[0] ?? e.fieldErrors.password?.[0] ?? e.fieldErrors.name?.[0] ?? 'Invalid input'
			});
		}

		const { email, password, name } = parsed.data;

		const [existing] = await db.select({ id: user.id }).from(user).where(eq(user.email, email)).limit(1);
		if (existing) return fail(400, { message: 'An account with this email already exists' });

		const userId = generateId(15);
		await db.insert(user).values({
			id: userId,
			email,
			name,
			hashedPassword: await hashPassword(password),
			emailVerified: false
		});

		await db.insert(userRole).values({ userId, roleId: 'member' });

		const verifyId = generateId(40);
		const expires = new Date(Date.now() + 1000 * 60 * 60 * 24);
		await db.insert(emailVerificationToken).values({ id: verifyId, userId, expiresAt: expires });

		const link = `${appOrigin()}/verify-email?token=${encodeURIComponent(verifyId)}`;
		await sendEmail({
			to: email,
			subject: 'Verify your email',
			html: `<p>Hi ${name},</p><p><a href="${link}">Verify your email address</a>.</p>`,
			text: `Verify: ${link}`
		});

		const session = await lucia.createSession(userId, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		cookies.set(sessionCookie.name, sessionCookie.value, { path: '/', ...sessionCookie.attributes });

		throw redirect(302, '/account');
	}
};

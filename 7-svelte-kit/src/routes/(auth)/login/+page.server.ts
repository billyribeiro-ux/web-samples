import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { loginSchema } from '$lib/schemas/auth';
import { lucia } from '$lib/server/auth/lucia';
import { verifyPassword } from '$lib/server/auth/password';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (locals.user) throw redirect(302, '/account');
	return { next: url.searchParams.get('next') ?? '/account' };
};

export const actions: Actions = {
	default: async ({ request, cookies, locals, url }) => {
		if (locals.user) throw redirect(302, '/account');

		const fd = await request.formData();
		const parsed = loginSchema.safeParse({
			email: fd.get('email'),
			password: fd.get('password')
		});

		if (!parsed.success) {
			const err = parsed.error.flatten();
			return fail(400, { message: err.fieldErrors.email?.[0] ?? err.fieldErrors.password?.[0] ?? 'Invalid input' });
		}

		const { email, password } = parsed.data;

		const [row] = await db.select().from(user).where(eq(user.email, email)).limit(1);
		if (!row?.hashedPassword) {
			return fail(400, { message: 'Invalid email or password' });
		}

		const valid = await verifyPassword(row.hashedPassword, password);
		if (!valid) return fail(400, { message: 'Invalid email or password' });

		const session = await lucia.createSession(row.id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		cookies.set(sessionCookie.name, sessionCookie.value, { path: '/', ...sessionCookie.attributes });

		const next = (fd.get('next') as string | null) ?? url.searchParams.get('next');
		throw redirect(302, next && next.startsWith('/') ? next : '/account');
	}
};

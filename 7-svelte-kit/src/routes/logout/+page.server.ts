import { redirect } from '@sveltejs/kit';
import { lucia } from '$lib/server/auth/lucia';
import type { Actions } from './$types';

export const actions = {
	default: async (event) => {
		if (!event.locals.session) throw redirect(303, '/login');
		await lucia.invalidateSession(event.locals.session.id);
		const blank = lucia.createBlankSessionCookie();
		event.cookies.set(blank.name, blank.value, { path: '/', ...blank.attributes });
		throw redirect(303, '/');
	}
} satisfies Actions;

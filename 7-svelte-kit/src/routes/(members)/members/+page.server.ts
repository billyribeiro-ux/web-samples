import { hasActiveSubscription } from '$lib/server/subscription';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const premium = locals.user ? await hasActiveSubscription(locals.user.id) : false;
	return { premium };
};

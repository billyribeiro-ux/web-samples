import { requireLogin } from '$lib/server/rbac/guards';
import { getPrimarySubscription } from '$lib/server/subscription';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	const user = requireLogin(event);
	const sub = await getPrimarySubscription(user.id);
	return {
		accountUser: user,
		subscription: sub
	};
};

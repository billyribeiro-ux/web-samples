import { requireAdmin } from '$lib/server/rbac/guards';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	requireAdmin(event);
	return {};
};

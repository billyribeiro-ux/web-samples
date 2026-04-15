import { getHeaderNav } from '$lib/server/navigation';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async () => {
	const headerNav = await getHeaderNav();
	return { headerNav };
};

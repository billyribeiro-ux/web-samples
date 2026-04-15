import { error, redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

export function requireLogin(event: RequestEvent): NonNullable<App.Locals['user']> {
	if (!event.locals.user) {
		const next = event.url.pathname + event.url.search;
		throw redirect(302, `/login?next=${encodeURIComponent(next)}`);
	}
	return event.locals.user;
}

export function requireAdmin(event: RequestEvent): void {
	requireLogin(event);
	const ok = event.locals.roles.some((r) =>
		['super_admin', 'admin', 'editor'].includes(r)
	);
	if (!ok) throw error(403, 'Admin access required');
}

export function requirePermission(event: RequestEvent, slug: string): void {
	requireLogin(event);
	if (!event.locals.permissions.has(slug)) throw error(403, 'Missing permission');
}

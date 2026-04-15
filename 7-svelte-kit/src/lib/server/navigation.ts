import { eq } from 'drizzle-orm';
import { db } from './db';
import { navigationMenu } from './db/schema';

export type NavItem = { label: string; href: string; external?: boolean };

const fallbackHeader: NavItem[] = [
	{ label: 'About', href: '/about' },
	{ label: 'Services', href: '/services' },
	{ label: 'Pricing', href: '/pricing' },
	{ label: 'Blog', href: '/blog' },
	{ label: 'Contact', href: '/contact' }
];

export async function getHeaderNav(): Promise<NavItem[]> {
	try {
		const [row] = await db
			.select()
			.from(navigationMenu)
			.where(eq(navigationMenu.name, 'header'))
			.limit(1);
		if (row?.items?.length) return row.items;
	} catch {
		// DB unavailable during early setup
	}
	return fallbackHeader;
}

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import * as schema from '../src/lib/server/db/schema.ts';
import { hashPassword } from '../src/lib/server/auth/password.ts';

if (!process.env.DATABASE_URL) {
	console.error('DATABASE_URL is required');
	process.exit(1);
}

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client, { schema });

async function main() {
	console.info('Seeding…');

	const permissions = [
		{ id: 'perm_admin_access', slug: 'admin.access', description: 'Access admin area' },
		{ id: 'perm_content_write', slug: 'content.write', description: 'Manage content' },
		{ id: 'perm_commerce', slug: 'commerce.manage', description: 'Manage commerce' },
		{ id: 'perm_users', slug: 'users.manage', description: 'Manage users' }
	];

	const roles = [
		{ id: 'super_admin', name: 'super_admin', description: 'Full access' },
		{ id: 'admin', name: 'admin', description: 'Administrator' },
		{ id: 'editor', name: 'editor', description: 'Editor' },
		{ id: 'member', name: 'member', description: 'Member' },
		{ id: 'customer', name: 'customer', description: 'Customer' }
	];

	await db.insert(schema.permission).values(permissions).onConflictDoNothing();
	await db.insert(schema.role).values(roles).onConflictDoNothing();

	await db
		.insert(schema.rolePermission)
		.values(
			permissions.map((p) => ({
				roleId: 'super_admin',
				permissionId: p.id
			}))
		)
		.onConflictDoNothing();

	await db
		.insert(schema.rolePermission)
		.values([
			{ roleId: 'admin', permissionId: 'perm_admin_access' },
			{ roleId: 'admin', permissionId: 'perm_content_write' },
			{ roleId: 'admin', permissionId: 'perm_commerce' },
			{ roleId: 'editor', permissionId: 'perm_content_write' }
		])
		.onConflictDoNothing();

	const adminId = 'user_seed_admin_x';
	const memberId = 'user_seed_memberx';
	const adminEmail = 'admin@example.com';
	const memberEmail = 'member@example.com';
	const passwordHash = await hashPassword('Password123!');

	const [existingAdmin] = await db.select().from(schema.user).where(eq(schema.user.email, adminEmail)).limit(1);
	if (!existingAdmin) {
		await db.insert(schema.user).values([
			{
				id: adminId,
				email: adminEmail,
				name: 'Admin User',
				emailVerified: true,
				hashedPassword: passwordHash
			},
			{
				id: memberId,
				email: memberEmail,
				name: 'Member User',
				emailVerified: true,
				hashedPassword: passwordHash
			}
		]);
		await db.insert(schema.userRole).values([
			{ userId: adminId, roleId: 'super_admin' },
			{ userId: memberId, roleId: 'member' }
		]);
	}

	const authorId = 'author_seed_001';
	await db
		.insert(schema.author)
		.values({
			id: authorId,
			name: 'Jordan Lee',
			slug: 'jordan-lee',
			bio: 'Principal product writer.'
		})
		.onConflictDoNothing();

	await db
		.insert(schema.category)
		.values([
			{ id: 'cat_growth', name: 'Growth', slug: 'growth', description: 'Acquisition and retention' },
			{ id: 'cat_engineering', name: 'Engineering', slug: 'engineering', description: 'Shipping with quality' }
		])
		.onConflictDoNothing();

	await db
		.insert(schema.tag)
		.values([
			{ id: 'tag_svelte', name: 'Svelte', slug: 'svelte' },
			{ id: 'tag_seo', name: 'SEO', slug: 'seo' }
		])
		.onConflictDoNothing();

	const now = new Date();
	const posts = [
		{
			id: 'post_seed_001',
			slug: 'shipping-faster-with-sveltekit',
			title: 'Shipping faster with SvelteKit',
			excerpt: 'Why SSR plus progressive enhancement wins for marketing sites.',
			bodyHtml: '<p>SvelteKit gives you server rendering, form actions, and lean client JS by default.</p>',
			status: 'published' as const,
			publishedAt: now,
			readingMinutes: 6,
			authorId,
			membersOnly: false,
			seoTitle: 'Shipping faster with SvelteKit',
			seoDescription: 'SSR and actions for serious sites.'
		},
		{
			id: 'post_seed_002',
			slug: 'seo-foundations-for-content-sites',
			title: 'SEO foundations for content sites',
			excerpt: 'Metadata, sitemaps, and structured publishing workflows.',
			bodyHtml: '<p>Great SEO is a product discipline: titles, internal links, and fast pages.</p>',
			status: 'published' as const,
			publishedAt: now,
			readingMinutes: 8,
			authorId,
			membersOnly: false
		},
		{
			id: 'post_seed_003',
			slug: 'membership-gating-patterns',
			title: 'Membership gating patterns',
			excerpt: 'Subscriber checks at the server boundary.',
			bodyHtml: '<p>Keep authorization on the server. Sessions and subscriptions decide access.</p>',
			status: 'published' as const,
			publishedAt: now,
			readingMinutes: 5,
			authorId,
			membersOnly: true
		}
	];

	await db.insert(schema.post).values(posts).onConflictDoNothing();

	await db
		.insert(schema.postCategory)
		.values([
			{ postId: 'post_seed_001', categoryId: 'cat_engineering' },
			{ postId: 'post_seed_002', categoryId: 'cat_growth' },
			{ postId: 'post_seed_003', categoryId: 'cat_growth' }
		])
		.onConflictDoNothing();

	await db
		.insert(schema.postTag)
		.values([
			{ postId: 'post_seed_001', tagId: 'tag_svelte' },
			{ postId: 'post_seed_002', tagId: 'tag_seo' }
		])
		.onConflictDoNothing();

	await db
		.insert(schema.product)
		.values([
			{
				id: 'prod_playbook',
				slug: 'launch-playbook',
				name: 'Launch Playbook',
				descriptionHtml: '<p>A digital playbook for shipping SaaS launches.</p>',
				priceCents: 4900,
				currency: 'usd',
				status: 'active',
				isDigital: true
			},
			{
				id: 'prod_templates',
				slug: 'email-templates',
				name: 'Email Templates Pack',
				descriptionHtml: '<p>Transactional and lifecycle email starters.</p>',
				priceCents: 1900,
				currency: 'usd',
				status: 'active',
				isDigital: true
			}
		])
		.onConflictDoNothing();

	await db
		.insert(schema.plan)
		.values([
			{
				id: 'plan_pro',
				name: 'Pro',
				slug: 'pro',
				description: 'For growing teams',
				priceMonthlyCents: 2900,
				priceYearlyCents: 29000,
				currency: 'usd',
				sortOrder: 1,
				active: true,
				features: ['Member library', 'Priority support', 'Stripe portal']
			},
			{
				id: 'plan_studio',
				name: 'Studio',
				slug: 'studio',
				description: 'For content-heavy brands',
				priceMonthlyCents: 7900,
				priceYearlyCents: 79000,
				currency: 'usd',
				sortOrder: 2,
				active: true,
				features: ['Everything in Pro', 'Dedicated editor seats', 'Advanced SEO']
			}
		])
		.onConflictDoNothing();

	await db
		.insert(schema.navigationMenu)
		.values({
			id: 'nav_main',
			name: 'header',
			items: [
				{ label: 'About', href: '/about' },
				{ label: 'Services', href: '/services' },
				{ label: 'Pricing', href: '/pricing' },
				{ label: 'Blog', href: '/blog' },
				{ label: 'Contact', href: '/contact' }
			]
		})
		.onConflictDoNothing();

	await db
		.insert(schema.siteSetting)
		.values([
			{
				key: 'site.name',
				value: { name: 'Acme Platform' }
			},
			{
				key: 'homepage.hero',
				value: {
					title: 'Build a serious web business',
					subtitle: 'Marketing, memberships, and commerce—one cohesive platform.'
				}
			}
		])
		.onConflictDoNothing();

	await db
		.insert(schema.page)
		.values([
			{
				id: 'page_about',
				slug: 'about',
				title: 'About',
				excerpt: 'We help teams ship premium web experiences.',
				bodyHtml: '<p>Acme Platform is a reference implementation for a modern digital business.</p>',
				status: 'published',
				publishedAt: now,
				seoTitle: 'About Acme Platform',
				seoDescription: 'Learn about our mission.'
			}
		])
		.onConflictDoNothing();

	console.info('Done. Admin login:', adminEmail, '/ Password123!');
	await client.end({ timeout: 5 });
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});

import {
	boolean,
	index,
	integer,
	jsonb,
	pgTable,
	primaryKey,
	text,
	timestamp,
	uniqueIndex,
	varchar
} from 'drizzle-orm/pg-core';
// ——— Lucia auth ———
export const user = pgTable('user', {
	id: text('id').primaryKey(),
	email: varchar('email', { length: 255 }).notNull().unique(),
	emailVerified: boolean('email_verified').notNull().default(false),
	hashedPassword: text('hashed_password'),
	name: varchar('name', { length: 255 }),
	avatarUrl: text('avatar_url'),
	stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
});

export const session = pgTable(
	'session',
	{
		id: text('id').primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
	},
	(t) => [index('session_user_id_idx').on(t.userId)]
);

export const passwordResetToken = pgTable('password_reset_token', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

export const emailVerificationToken = pgTable('email_verification_token', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

// ——— RBAC ———
export const role = pgTable('role', {
	id: text('id').primaryKey(),
	name: varchar('name', { length: 64 }).notNull().unique(),
	description: text('description')
});

export const permission = pgTable('permission', {
	id: text('id').primaryKey(),
	slug: varchar('slug', { length: 128 }).notNull().unique(),
	description: text('description')
});

export const userRole = pgTable(
	'user_role',
	{
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		roleId: text('role_id')
			.notNull()
			.references(() => role.id, { onDelete: 'cascade' })
	},
	(t) => [primaryKey({ columns: [t.userId, t.roleId] })]
);

export const rolePermission = pgTable(
	'role_permission',
	{
		roleId: text('role_id')
			.notNull()
			.references(() => role.id, { onDelete: 'cascade' }),
		permissionId: text('permission_id')
			.notNull()
			.references(() => permission.id, { onDelete: 'cascade' })
	},
	(t) => [primaryKey({ columns: [t.roleId, t.permissionId] })]
);

// ——— Authors & media ———
export const author = pgTable('author', {
	id: text('id').primaryKey(),
	userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
	name: varchar('name', { length: 255 }).notNull(),
	slug: varchar('slug', { length: 255 }).notNull().unique(),
	bio: text('bio'),
	imageUrl: text('image_url'),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
});

export const mediaAsset = pgTable(
	'media_asset',
	{
		id: text('id').primaryKey(),
		key: text('key').notNull(),
		bucket: varchar('bucket', { length: 255 }).notNull(),
		url: text('url').notNull(),
		mimeType: varchar('mime_type', { length: 128 }).notNull(),
		sizeBytes: integer('size_bytes').notNull(),
		alt: text('alt'),
		title: varchar('title', { length: 512 }),
		createdById: text('created_by_id').references(() => user.id, { onDelete: 'set null' }),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
	},
	(t) => [index('media_key_idx').on(t.key)]
);

// ——— Content: pages & posts ———
export const page = pgTable(
	'page',
	{
		id: text('id').primaryKey(),
		slug: varchar('slug', { length: 255 }).notNull().unique(),
		title: varchar('title', { length: 512 }).notNull(),
		excerpt: text('excerpt'),
		bodyHtml: text('body_html').notNull(),
		status: varchar('status', { length: 32 }).notNull().default('draft'), // draft | published | scheduled
		publishedAt: timestamp('published_at', { withTimezone: true, mode: 'date' }),
		scheduledFor: timestamp('scheduled_for', { withTimezone: true, mode: 'date' }),
		seoTitle: varchar('seo_title', { length: 512 }),
		seoDescription: text('seo_description'),
		canonicalUrl: text('canonical_url'),
		ogImageUrl: text('og_image_url'),
		twitterCard: varchar('twitter_card', { length: 32 }).default('summary_large_image'),
		featuredMediaId: text('featured_media_id').references(() => mediaAsset.id, { onDelete: 'set null' }),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
	},
	(t) => [index('page_status_idx').on(t.status)]
);

export const category = pgTable('category', {
	id: text('id').primaryKey(),
	name: varchar('name', { length: 255 }).notNull(),
	slug: varchar('slug', { length: 255 }).notNull().unique(),
	description: text('description')
});

export const tag = pgTable('tag', {
	id: text('id').primaryKey(),
	name: varchar('name', { length: 255 }).notNull(),
	slug: varchar('slug', { length: 255 }).notNull().unique()
});

export const post = pgTable(
	'post',
	{
		id: text('id').primaryKey(),
		slug: varchar('slug', { length: 255 }).notNull().unique(),
		title: varchar('title', { length: 512 }).notNull(),
		excerpt: text('excerpt'),
		bodyHtml: text('body_html').notNull(),
		status: varchar('status', { length: 32 }).notNull().default('draft'),
		publishedAt: timestamp('published_at', { withTimezone: true, mode: 'date' }),
		scheduledFor: timestamp('scheduled_for', { withTimezone: true, mode: 'date' }),
		readingMinutes: integer('reading_minutes').notNull().default(1),
		authorId: text('author_id')
			.notNull()
			.references(() => author.id, { onDelete: 'restrict' }),
		featuredMediaId: text('featured_media_id').references(() => mediaAsset.id, { onDelete: 'set null' }),
		membersOnly: boolean('members_only').notNull().default(false),
		seoTitle: varchar('seo_title', { length: 512 }),
		seoDescription: text('seo_description'),
		canonicalUrl: text('canonical_url'),
		ogImageUrl: text('og_image_url'),
		twitterCard: varchar('twitter_card', { length: 32 }).default('summary_large_image'),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
	},
	(t) => [
		index('post_status_pub_idx').on(t.status, t.publishedAt),
		index('post_author_idx').on(t.authorId)
	]
);

export const postCategory = pgTable(
	'post_category',
	{
		postId: text('post_id')
			.notNull()
			.references(() => post.id, { onDelete: 'cascade' }),
		categoryId: text('category_id')
			.notNull()
			.references(() => category.id, { onDelete: 'cascade' })
	},
	(t) => [primaryKey({ columns: [t.postId, t.categoryId] })]
);

export const postTag = pgTable(
	'post_tag',
	{
		postId: text('post_id')
			.notNull()
			.references(() => post.id, { onDelete: 'cascade' }),
		tagId: text('tag_id')
			.notNull()
			.references(() => tag.id, { onDelete: 'cascade' })
	},
	(t) => [primaryKey({ columns: [t.postId, t.tagId] })]
);

export const relatedPost = pgTable(
	'related_post',
	{
		postId: text('post_id')
			.notNull()
			.references(() => post.id, { onDelete: 'cascade' }),
		relatedPostId: text('related_post_id')
			.notNull()
			.references(() => post.id, { onDelete: 'cascade' })
	},
	(t) => [primaryKey({ columns: [t.postId, t.relatedPostId] })]
);

// ——— Navigation & settings ———
export const navigationMenu = pgTable('navigation_menu', {
	id: text('id').primaryKey(),
	name: varchar('name', { length: 64 }).notNull().unique(),
	items: jsonb('items')
		.notNull()
		.$type<{ label: string; href: string; external?: boolean }[]>()
});

export const siteSetting = pgTable('site_setting', {
	key: varchar('key', { length: 128 }).primaryKey(),
	value: jsonb('value').notNull()
});

export const redirect = pgTable(
	'redirect',
	{
		id: text('id').primaryKey(),
		fromPath: varchar('from_path', { length: 512 }).notNull(),
		toPath: varchar('to_path', { length: 512 }).notNull(),
		permanent: boolean('permanent').notNull().default(false)
	},
	(t) => [uniqueIndex('redirect_from_idx').on(t.fromPath)]
);

// ——— Commerce ———
export const product = pgTable(
	'product',
	{
		id: text('id').primaryKey(),
		slug: varchar('slug', { length: 255 }).notNull().unique(),
		name: varchar('name', { length: 512 }).notNull(),
		descriptionHtml: text('description_html').notNull(),
		priceCents: integer('price_cents').notNull(),
		currency: varchar('currency', { length: 8 }).notNull().default('usd'),
		status: varchar('status', { length: 32 }).notNull().default('draft'),
		stripePriceId: varchar('stripe_price_id', { length: 255 }),
		stripeProductId: varchar('stripe_product_id', { length: 255 }),
		imageMediaId: text('image_media_id').references(() => mediaAsset.id, { onDelete: 'set null' }),
		isDigital: boolean('is_digital').notNull().default(true),
		inventory: integer('inventory'),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
	},
	(t) => [index('product_status_idx').on(t.status)]
);

export const productCategory = pgTable(
	'product_category',
	{
		productId: text('product_id')
			.notNull()
			.references(() => product.id, { onDelete: 'cascade' }),
		categoryId: text('category_id')
			.notNull()
			.references(() => category.id, { onDelete: 'cascade' })
	},
	(t) => [primaryKey({ columns: [t.productId, t.categoryId] })]
);

export const plan = pgTable('plan', {
	id: text('id').primaryKey(),
	name: varchar('name', { length: 255 }).notNull(),
	slug: varchar('slug', { length: 255 }).notNull().unique(),
	description: text('description'),
	priceMonthlyCents: integer('price_monthly_cents').notNull(),
	priceYearlyCents: integer('price_yearly_cents').notNull(),
	currency: varchar('currency', { length: 8 }).notNull().default('usd'),
	stripePriceMonthlyId: varchar('stripe_price_monthly_id', { length: 255 }),
	stripePriceYearlyId: varchar('stripe_price_yearly_id', { length: 255 }),
	stripeProductId: varchar('stripe_product_id', { length: 255 }),
	features: jsonb('features').$type<string[]>(),
	sortOrder: integer('sort_order').notNull().default(0),
	active: boolean('active').notNull().default(true)
});

export const subscription = pgTable(
	'subscription',
	{
		id: text('id').primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		planId: text('plan_id')
			.notNull()
			.references(() => plan.id, { onDelete: 'restrict' }),
		stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }).unique(),
		status: varchar('status', { length: 32 }).notNull(),
		currentPeriodEnd: timestamp('current_period_end', { withTimezone: true, mode: 'date' }),
		cancelAtPeriodEnd: boolean('cancel_at_period_end').notNull().default(false),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
	},
	(t) => [index('subscription_user_idx').on(t.userId)]
);

export const cart = pgTable('cart', {
	id: text('id').primaryKey(),
	userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
	updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
});

export const cartItem = pgTable(
	'cart_item',
	{
		cartId: text('cart_id')
			.notNull()
			.references(() => cart.id, { onDelete: 'cascade' }),
		productId: text('product_id')
			.notNull()
			.references(() => product.id, { onDelete: 'cascade' }),
		quantity: integer('quantity').notNull().default(1)
	},
	(t) => [primaryKey({ columns: [t.cartId, t.productId] })]
);

export const order = pgTable(
	'order',
	{
		id: text('id').primaryKey(),
		userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
		email: varchar('email', { length: 255 }).notNull(),
		status: varchar('status', { length: 32 }).notNull().default('pending'),
		totalCents: integer('total_cents').notNull(),
		currency: varchar('currency', { length: 8 }).notNull().default('usd'),
		stripeCheckoutSessionId: varchar('stripe_checkout_session_id', { length: 255 }),
		stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 }),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
	},
	(t) => [index('order_user_idx').on(t.userId)]
);

export const orderItem = pgTable('order_item', {
	id: text('id').primaryKey(),
	orderId: text('order_id')
		.notNull()
		.references(() => order.id, { onDelete: 'cascade' }),
	productId: text('product_id')
		.notNull()
		.references(() => product.id, { onDelete: 'restrict' }),
	quantity: integer('quantity').notNull(),
	unitPriceCents: integer('unit_price_cents').notNull()
});

// ——— Forms & leads ———
export const formSubmission = pgTable(
	'form_submission',
	{
		id: text('id').primaryKey(),
		formType: varchar('form_type', { length: 64 }).notNull(),
		payload: jsonb('payload').notNull().$type<Record<string, unknown>>(),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
	},
	(t) => [index('form_type_idx').on(t.formType)]
);

export const newsletterLead = pgTable('newsletter_lead', {
	id: text('id').primaryKey(),
	email: varchar('email', { length: 255 }).notNull(),
	source: varchar('source', { length: 128 }),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
});

// ——— Favorites ———
export const favorite = pgTable(
	'favorite',
	{
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		productId: text('product_id')
			.notNull()
			.references(() => product.id, { onDelete: 'cascade' }),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
	},
	(t) => [primaryKey({ columns: [t.userId, t.productId] })]
);

export const gatedContentRule = pgTable('gated_content_rule', {
	id: text('id').primaryKey(),
	resourceType: varchar('resource_type', { length: 32 }).notNull(),
	resourceId: text('resource_id').notNull(),
	planId: text('plan_id').references(() => plan.id, { onDelete: 'cascade' }),
	requiresActiveSubscription: boolean('requires_active_subscription').notNull().default(true)
});

import { and, desc, eq, isNull, lte, or } from 'drizzle-orm';
import { db } from '../db';
import { author, category, post, postCategory, postTag, tag } from '../db/schema';

function publishedWhere() {
	const now = new Date();
	return and(
		eq(post.status, 'published'),
		or(lte(post.publishedAt, now), isNull(post.publishedAt))
	);
}

export async function listPublishedPosts(limit = 20) {
	return db
		.select({
			post,
			author
		})
		.from(post)
		.innerJoin(author, eq(post.authorId, author.id))
		.where(publishedWhere())
		.orderBy(desc(post.publishedAt))
		.limit(limit);
}

export async function getPostBySlug(slug: string) {
	const [row] = await db
		.select({ post, author })
		.from(post)
		.innerJoin(author, eq(post.authorId, author.id))
		.where(and(eq(post.slug, slug), publishedWhere()))
		.limit(1);

	if (!row) return null;

	const cats = await db
		.select({ category })
		.from(postCategory)
		.innerJoin(category, eq(postCategory.categoryId, category.id))
		.where(eq(postCategory.postId, row.post.id));

	const tags = await db
		.select({ tag })
		.from(postTag)
		.innerJoin(tag, eq(postTag.tagId, tag.id))
		.where(eq(postTag.postId, row.post.id));

	return { ...row, categories: cats.map((c) => c.category), tags: tags.map((t) => t.tag) };
}

export async function listPostsByCategorySlug(catSlug: string) {
	const [c] = await db.select().from(category).where(eq(category.slug, catSlug)).limit(1);
	if (!c) return { category: null as null, posts: [] as (typeof post.$inferSelect)[] };

	const rows = await db
		.select({ post })
		.from(post)
		.innerJoin(postCategory, eq(post.id, postCategory.postId))
		.where(and(eq(postCategory.categoryId, c.id), publishedWhere()))
		.orderBy(desc(post.publishedAt));

	return { category: c, posts: rows.map((r) => r.post) };
}

export async function listPostsByTagSlug(tagSlug: string) {
	const [t] = await db.select().from(tag).where(eq(tag.slug, tagSlug)).limit(1);
	if (!t) return { tag: null as null, posts: [] as (typeof post.$inferSelect)[] };

	const rows = await db
		.select({ post })
		.from(post)
		.innerJoin(postTag, eq(post.id, postTag.postId))
		.where(and(eq(postTag.tagId, t.id), publishedWhere()))
		.orderBy(desc(post.publishedAt));

	return { tag: t, posts: rows.map((r) => r.post) };
}

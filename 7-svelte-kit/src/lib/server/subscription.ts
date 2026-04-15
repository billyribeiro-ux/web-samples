import { and, desc, eq, or } from 'drizzle-orm';
import { db } from './db';
import { subscription } from './db/schema';

export async function hasActiveSubscription(userId: string): Promise<boolean> {
	const rows = await db
		.select({ status: subscription.status, end: subscription.currentPeriodEnd })
		.from(subscription)
		.where(eq(subscription.userId, userId));

	const now = new Date();
	return rows.some(
		(r) => (r.status === 'active' || r.status === 'trialing') && (!r.end || r.end > now)
	);
}

export async function getPrimarySubscription(userId: string) {
	const [row] = await db
		.select()
		.from(subscription)
		.where(
			and(
				eq(subscription.userId, userId),
				or(eq(subscription.status, 'active'), eq(subscription.status, 'trialing'))
			)
		)
		.orderBy(desc(subscription.createdAt))
		.limit(1);
	return row ?? null;
}

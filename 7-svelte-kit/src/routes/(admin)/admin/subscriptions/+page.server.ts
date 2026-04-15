import { desc, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { plan, subscription, user } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const rows = await db
		.select({
			subscription,
			email: user.email,
			planName: plan.name
		})
		.from(subscription)
		.innerJoin(user, eq(subscription.userId, user.id))
		.innerJoin(plan, eq(subscription.planId, plan.id))
		.orderBy(desc(subscription.updatedAt))
		.limit(200);
	return { subscriptions: rows };
};

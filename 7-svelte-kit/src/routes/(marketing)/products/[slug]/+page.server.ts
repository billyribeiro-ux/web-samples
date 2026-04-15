import { error, fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { addToCart, getOrCreateCartId } from '$lib/server/cart';
import { db } from '$lib/server/db';
import { product } from '$lib/server/db/schema';
import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const [p] = await db.select().from(product).where(eq(product.slug, params.slug)).limit(1);
	if (!p || p.status !== 'active') throw error(404, 'Not found');
	return { product: p };
};

const addSchema = z.object({
	quantity: z.coerce.number().int().min(1).max(99)
});

export const actions: Actions = {
	add: async (event) => {
		const { params, request, cookies, locals } = event;
		const [p] = await db.select().from(product).where(eq(product.slug, params.slug)).limit(1);
		if (!p || p.status !== 'active') return fail(400, { message: 'Invalid product' });

		const fd = await request.formData();
		const parsed = addSchema.safeParse({ quantity: fd.get('quantity') ?? 1 });
		if (!parsed.success) return fail(400, { message: 'Invalid quantity' });

		const cartId = await getOrCreateCartId(cookies, locals.user?.id ?? null);
		await addToCart(cartId, p.id, parsed.data.quantity);
		return { ok: true };
	}
};

import { and, eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import type { Cookies } from '@sveltejs/kit';
import { db } from './db';
import { cart, cartItem, product } from './db/schema';

export const CART_COOKIE = 'cart_id';

export async function getOrCreateCartId(cookies: Cookies, userId: string | null): Promise<string> {
	const existing = cookies.get(CART_COOKIE);
	if (existing) {
		const [c] = await db.select().from(cart).where(eq(cart.id, existing)).limit(1);
		if (c) {
			if (userId && !c.userId) {
				await db.update(cart).set({ userId, updatedAt: new Date() }).where(eq(cart.id, c.id));
			}
			return c.id;
		}
	}

	const id = nanoid();
	await db.insert(cart).values({ id, userId });
	cookies.set(CART_COOKIE, id, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		maxAge: 60 * 60 * 24 * 90
	});
	return id;
}

export async function getCartLines(cartId: string) {
	return db
		.select({
			product,
			quantity: cartItem.quantity
		})
		.from(cartItem)
		.innerJoin(product, eq(cartItem.productId, product.id))
		.where(eq(cartItem.cartId, cartId));
}

export async function addToCart(cartId: string, productId: string, quantity: number) {
	const [row] = await db
		.select()
		.from(cartItem)
		.where(and(eq(cartItem.cartId, cartId), eq(cartItem.productId, productId)))
		.limit(1);

	if (row) {
		await db
			.update(cartItem)
			.set({ quantity: row.quantity + quantity })
			.where(and(eq(cartItem.cartId, cartId), eq(cartItem.productId, productId)));
	} else {
		await db.insert(cartItem).values({ cartId, productId, quantity });
	}
	await db.update(cart).set({ updatedAt: new Date() }).where(eq(cart.id, cartId));
}

export async function clearCart(cartId: string) {
	await db.delete(cartItem).where(eq(cartItem.cartId, cartId));
}

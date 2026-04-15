import type { AstroCookies } from 'astro';

import { prisma } from '@/lib/prisma';

export const CART_COOKIE = 'cart_id';

export async function getCart(cartId: string | undefined) {
  if (!cartId) return null;
  return prisma.cart.findUnique({
    where: { id: cartId },
    include: { items: { include: { product: true } } },
  });
}

export async function getOrCreateCartCookie(cookies: AstroCookies, userId: string | null) {
  let cartId = cookies.get(CART_COOKIE)?.value;
  let cart = cartId ? await getCart(cartId) : null;

  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        userId: userId ?? undefined,
        sessionKey: userId ? undefined : crypto.randomUUID(),
      },
      include: { items: { include: { product: true } } },
    });
    cookies.set(CART_COOKIE, cart.id, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: import.meta.env.PROD,
      maxAge: 60 * 60 * 24 * 60,
    });
  } else if (userId && !cart.userId) {
    cart = await prisma.cart.update({
      where: { id: cart.id },
      data: { userId },
      include: { items: { include: { product: true } } },
    });
  }

  return cart;
}

"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

const CART_COOKIE = "cart_session_id";
const CART_TTL_DAYS = 14;

async function getOrCreateCartSessionId(): Promise<string> {
  const jar = await cookies();
  const cookieId = jar.get(CART_COOKIE)?.value;
  if (cookieId) {
    const existing = await prisma.cartSession.findUnique({ where: { id: cookieId } });
    if (existing && existing.expiresAt > new Date()) return cookieId;
  }
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + CART_TTL_DAYS);
  const session = await prisma.cartSession.create({
    data: { expiresAt },
  });
  jar.set(CART_COOKIE, session.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
  return session.id;
}

export async function addToCartAction(productId: string, quantity: number) {
  const cartId = await getOrCreateCartSessionId();
  await prisma.cartItem.upsert({
    where: {
      cartSessionId_productId: { cartSessionId: cartId, productId },
    },
    create: { cartSessionId: cartId, productId, quantity },
    update: { quantity: { increment: quantity } },
  });
  revalidatePath("/cart");
}

export async function setCartQuantityAction(productId: string, quantity: number) {
  const cartId = await getOrCreateCartSessionId();
  if (quantity <= 0) {
    await prisma.cartItem.deleteMany({ where: { cartSessionId: cartId, productId } });
    revalidatePath("/cart");
    return;
  }
  await prisma.cartItem.upsert({
    where: {
      cartSessionId_productId: { cartSessionId: cartId, productId },
    },
    create: { cartSessionId: cartId, productId, quantity },
    update: { quantity },
  });
  revalidatePath("/cart");
}

export async function getCartForSession() {
  const jar = await cookies();
  const id = jar.get(CART_COOKIE)?.value;
  if (!id) return null;
  return prisma.cartSession.findUnique({
    where: { id },
    include: {
      items: { include: { product: true } },
    },
  });
}

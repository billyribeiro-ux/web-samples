"use server";

import { prisma } from "@/lib/db";
import { getCart, setCart } from "@/lib/cart";
import { revalidatePath } from "next/cache";

export async function addToCart(productId: string, qty = 1) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.status !== "PUBLISHED") {
    return { error: "Product unavailable" };
  }
  const cart = await getCart();
  cart[productId] = (cart[productId] ?? 0) + qty;
  await setCart(cart);
  revalidatePath("/cart");
  return { ok: true };
}

export async function updateCartItem(productId: string, qty: number) {
  const cart = await getCart();
  if (qty <= 0) {
    delete cart[productId];
  } else {
    cart[productId] = qty;
  }
  await setCart(cart);
  revalidatePath("/cart");
  return { ok: true };
}

export async function clearCart() {
  await setCart({});
  revalidatePath("/cart");
}

import { cookies } from "next/headers";
import { z } from "zod";

const cartSchema = z.record(z.string(), z.number().int().positive());

export type CartState = Record<string, number>;

export async function getCart(): Promise<CartState> {
  const c = await cookies();
  const raw = c.get("cart")?.value;
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return cartSchema.parse(parsed);
  } catch {
    return {};
  }
}

export async function setCart(cart: CartState) {
  const c = await cookies();
  c.set("cart", JSON.stringify(cart), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

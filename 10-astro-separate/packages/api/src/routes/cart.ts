import { Hono } from "hono";
import { z } from "zod";
import type { Cart, CartItem, Product } from "@repo/db";
import { prisma, SessionScope } from "@repo/db";
import { loadSession } from "../middleware/session.js";
import type { AppEnv } from "../types.js";
import { ApiError } from "../lib/errors.js";
import { randomToken } from "../lib/token.js";

type CartWithItems = Cart & { items: (CartItem & { product: Product })[] };

async function resolveCart(c: {
  req: { header: (n: string) => string | undefined };
  get: (k: "authUser") => AppEnv["Variables"]["authUser"];
}): Promise<{ cart: CartWithItems; guestKey?: string }> {
  const user = c.get("authUser");
  if (user) {
    let cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: { items: { include: { product: true } } },
    });
    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: user.id },
        include: { items: { include: { product: true } } },
      });
    }
    return { cart };
  }
  let guestKey = c.req.header("x-guest-cart");
  if (!guestKey) {
    guestKey = randomToken(16);
  }
  let cart = await prisma.cart.findUnique({
    where: { guestKey },
    include: { items: { include: { product: true } } },
  });
  if (!cart) {
    cart = await prisma.cart.create({
      data: { guestKey },
      include: { items: { include: { product: true } } },
    });
  }
  return { cart, guestKey: cart.guestKey ?? guestKey };
}

export const cartRoutes = new Hono<AppEnv>();
cartRoutes.use("*", loadSession(SessionScope.MEMBER));

cartRoutes.get("/", async (c) => {
  const { cart, guestKey } = await resolveCart(c);
  return c.json({ cart, guestKey });
});

cartRoutes.post("/items", async (c) => {
  const body = z
    .object({ productId: z.string().min(1), quantity: z.number().int().min(1).max(99) })
    .parse(await c.req.json());

  const product = await prisma.product.findUnique({ where: { id: body.productId } });
  if (!product) throw new ApiError(404, "Product not found", "NOT_FOUND");

  const { cart, guestKey } = await resolveCart(c);

  await prisma.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId: body.productId } },
    create: { cartId: cart.id, productId: body.productId, quantity: body.quantity },
    update: { quantity: body.quantity },
  });

  const fresh = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: { items: { include: { product: true } } },
  });
  return c.json({ cart: fresh, guestKey });
});

cartRoutes.delete("/items/:productId", async (c) => {
  const productId = c.req.param("productId");
  const { cart, guestKey } = await resolveCart(c);
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId } });
  const fresh = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: { items: { include: { product: true } } },
  });
  return c.json({ cart: fresh, guestKey });
});

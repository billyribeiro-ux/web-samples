import { Router } from "express";
import { z } from "zod";
import { HttpError } from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";
import { ensureGuestCookie } from "../lib/guest.js";
import { paramStr } from "../lib/params.js";

export const cartRouter = Router();

async function getOrCreateCart(req: Express.Request, res: import("express").Response) {
  const cookies = req.cookies;
  const userId = req.sessionRecord?.user?.id;

  if (userId) {
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: { include: { featuredImage: true } } } } },
    });
    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: { items: { include: { product: { include: { featuredImage: true } } } } },
      });
    }
    return cart;
  }

  const gid = ensureGuestCookie(req.env, res, cookies);
  let cart = await prisma.cart.findUnique({
    where: { guestId: gid },
    include: { items: { include: { product: { include: { featuredImage: true } } } } },
  });
  if (!cart) {
    cart = await prisma.cart.create({
      data: { guestId: gid },
      include: { items: { include: { product: { include: { featuredImage: true } } } } },
    });
  }
  return cart;
}

cartRouter.get("/", async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req, res);
    res.json(cart);
  } catch (e) {
    next(e);
  }
});

const addItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(99).default(1),
});

cartRouter.post("/items", async (req, res, next) => {
  try {
    const parsed = addItemSchema.safeParse(req.body);
    if (!parsed.success) return next(new HttpError(400, "Invalid input"));
    const cart = await getOrCreateCart(req, res);
    const product = await prisma.product.findFirst({
      where: { id: parsed.data.productId, published: true },
    });
    if (!product) return next(new HttpError(404, "Product not found"));

    await prisma.cartItem.upsert({
      where: {
        cartId_productId: { cartId: cart.id, productId: product.id },
      },
      create: {
        cartId: cart.id,
        productId: product.id,
        quantity: parsed.data.quantity,
      },
      update: {
        quantity: { increment: parsed.data.quantity },
      },
    });

    const updated = await prisma.cart.findUniqueOrThrow({
      where: { id: cart.id },
      include: { items: { include: { product: { include: { featuredImage: true } } } } },
    });
    res.json(updated);
  } catch (e) {
    next(e);
  }
});

cartRouter.patch("/items/:itemId", async (req, res, next) => {
  try {
    const quantity = z.coerce.number().int().min(1).max(99).parse(req.body.quantity);
    const cart = await getOrCreateCart(req, res);
    const item = await prisma.cartItem.findFirst({
      where: { id: paramStr(req.params.itemId), cartId: cart.id },
    });
    if (!item) return next(new HttpError(404, "Not found"));
    await prisma.cartItem.update({ where: { id: item.id }, data: { quantity } });
    const updated = await prisma.cart.findUniqueOrThrow({
      where: { id: cart.id },
      include: { items: { include: { product: { include: { featuredImage: true } } } } },
    });
    res.json(updated);
  } catch (e) {
    next(e);
  }
});

cartRouter.delete("/items/:itemId", async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req, res);
    await prisma.cartItem.deleteMany({
      where: { id: paramStr(req.params.itemId), cartId: cart.id },
    });
    const updated = await prisma.cart.findUniqueOrThrow({
      where: { id: cart.id },
      include: { items: { include: { product: { include: { featuredImage: true } } } } },
    });
    res.json(updated);
  } catch (e) {
    next(e);
  }
});

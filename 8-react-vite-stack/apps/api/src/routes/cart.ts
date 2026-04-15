import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { routeString } from '../lib/routeParams.js';
import { asyncHandler, HttpError } from '../middleware/errors.js';
import { attachDbUserOptional, type RequestWithUser } from '../middleware/dbUser.js';

const COOKIE = 'cart_session';
const MAX_AGE_MS = 60 * 60 * 24 * 90 * 1000;

export const cartRouter = Router();
cartRouter.use(attachDbUserOptional);

async function getOrCreateCart(req: RequestWithUser, res: import('express').Response) {
  let sessionId = req.cookies[COOKIE] as string | undefined;
  if (!sessionId) {
    sessionId = randomUUID();
    res.cookie(COOKIE, sessionId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: MAX_AGE_MS,
    });
  }

  let cart = await prisma.cart.findUnique({
    where: { sessionId },
    include: { items: { include: { product: { include: { featuredImage: true } } } } },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { sessionId, userId: req.dbUser?.id },
      include: { items: { include: { product: { include: { featuredImage: true } } } } },
    });
  } else if (req.dbUser?.id && !cart.userId) {
    await prisma.cart.update({
      where: { id: cart.id },
      data: { userId: req.dbUser.id },
    });
    cart = await prisma.cart.findUniqueOrThrow({
      where: { id: cart.id },
      include: { items: { include: { product: { include: { featuredImage: true } } } } },
    });
  }

  return cart;
}

cartRouter.get(
  '/',
  asyncHandler(async (req: RequestWithUser, res) => {
    const cart = await getOrCreateCart(req, res);
    res.json({ cart });
  })
);

const itemBody = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(99).default(1),
});

cartRouter.post(
  '/items',
  asyncHandler(async (req: RequestWithUser, res) => {
    const body = itemBody.parse(req.body);
    const cart = await getOrCreateCart(req, res);
    const product = await prisma.product.findFirst({
      where: { id: body.productId, status: 'ACTIVE' },
    });
    if (!product) throw new HttpError(404, 'Product not found');

    await prisma.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId: product.id } },
      update: { quantity: body.quantity },
      create: { cartId: cart.id, productId: product.id, quantity: body.quantity },
    });

    const updated = await prisma.cart.findUniqueOrThrow({
      where: { id: cart.id },
      include: { items: { include: { product: { include: { featuredImage: true } } } } },
    });
    res.json({ cart: updated });
  })
);

cartRouter.delete(
  '/items/:productId',
  asyncHandler(async (req: RequestWithUser, res) => {
    const cart = await getOrCreateCart(req, res);
    const productId = routeString(req.params.productId);
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id, productId },
    });
    const updated = await prisma.cart.findUniqueOrThrow({
      where: { id: cart.id },
      include: { items: { include: { product: { include: { featuredImage: true } } } } },
    });
    res.json({ cart: updated });
  })
);

cartRouter.post(
  '/clear',
  asyncHandler(async (req: RequestWithUser, res) => {
    const cart = await getOrCreateCart(req, res);
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    res.json({ ok: true });
  })
);

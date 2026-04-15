import { Router } from 'express';
import { z } from 'zod';
import Stripe from 'stripe';
import type { Env } from '../lib/env.js';
import { prisma } from '../lib/prisma.js';
import { routeString } from '../lib/routeParams.js';
import { hasMinRole } from '../lib/roles.js';
import { asyncHandler, HttpError } from '../middleware/errors.js';
import { requireDbUser, type RequestWithUser } from '../middleware/dbUser.js';

export function createMeRouter(env: Env) {
  const router = Router();
  router.use(requireDbUser);

  router.get(
    '/profile',
    asyncHandler(async (req: RequestWithUser, res) => {
      const u = req.dbUser!;
      res.json({
        id: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        imageUrl: u.imageUrl,
        role: u.role,
      });
    })
  );

  router.patch(
    '/profile',
    asyncHandler(async (req: RequestWithUser, res) => {
      const schema = z.object({
        firstName: z.string().max(100).optional(),
        lastName: z.string().max(100).optional(),
      });
      const body = schema.parse(req.body);
      const u = await prisma.user.update({
        where: { id: req.dbUser!.id },
        data: body,
      });
      res.json(u);
    })
  );

  router.get(
    '/subscription',
    asyncHandler(async (req: RequestWithUser, res) => {
      const sub = await prisma.subscription.findFirst({
        where: { userId: req.dbUser!.id },
        orderBy: { updatedAt: 'desc' },
        include: { plan: true },
      });
      res.json({ subscription: sub });
    })
  );

  router.post(
    '/billing-portal',
    asyncHandler(async (req: RequestWithUser, res) => {
      if (!env.STRIPE_SECRET_KEY) throw new HttpError(503, 'Stripe not configured');
      const stripe = new Stripe(env.STRIPE_SECRET_KEY);
      const sub = await prisma.subscription.findFirst({
        where: { userId: req.dbUser!.id },
        orderBy: { updatedAt: 'desc' },
      });
      if (!sub?.stripeCustomerId) {
        throw new HttpError(400, 'No Stripe customer on file');
      }
      const schema = z.object({ returnUrl: z.string().url() });
      const { returnUrl } = schema.parse(req.body);
      const session = await stripe.billingPortal.sessions.create({
        customer: sub.stripeCustomerId,
        return_url: returnUrl,
      });
      res.json({ url: session.url });
    })
  );

  router.get(
    '/orders',
    asyncHandler(async (req: RequestWithUser, res) => {
      const orders = await prisma.order.findMany({
        where: { userId: req.dbUser!.id },
        orderBy: { createdAt: 'desc' },
        include: { items: { include: { product: true } } },
      });
      res.json({ items: orders });
    })
  );

  router.get(
    '/favorites',
    asyncHandler(async (req: RequestWithUser, res) => {
      const favs = await prisma.favorite.findMany({
        where: { userId: req.dbUser!.id },
        include: { product: { include: { featuredImage: true } } },
      });
      res.json({ items: favs });
    })
  );

  router.post(
    '/favorites/:productId',
    asyncHandler(async (req: RequestWithUser, res) => {
      const productId = routeString(req.params.productId);
      const product = await prisma.product.findUnique({ where: { id: productId } });
      if (!product) throw new HttpError(404, 'Product not found');
      await prisma.favorite.upsert({
        where: {
          userId_productId: { userId: req.dbUser!.id, productId },
        },
        update: {},
        create: { userId: req.dbUser!.id, productId },
      });
      res.status(201).json({ ok: true });
    })
  );

  router.delete(
    '/favorites/:productId',
    asyncHandler(async (req: RequestWithUser, res) => {
      const productId = routeString(req.params.productId);
      await prisma.favorite.deleteMany({
        where: { userId: req.dbUser!.id, productId },
      });
      res.json({ ok: true });
    })
  );

  router.get(
    '/library',
    asyncHandler(async (req: RequestWithUser, res) => {
      const user = req.dbUser!;
      const rules = await prisma.gatedContentRule.findMany({
        where: { published: true },
        orderBy: { updatedAt: 'desc' },
      });
      const visible = rules.filter((r) => hasMinRole(user.role, r.minRole));
      res.json({ items: visible });
    })
  );

  return router;
}

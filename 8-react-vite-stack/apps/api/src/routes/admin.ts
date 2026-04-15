import { Router } from 'express';
import { z } from 'zod';
import {
  ContentStatus,
  FormType,
  OrderStatus,
  Prisma,
  ProductStatus,
  UserRole,
} from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { sanitizeHtml } from '../lib/sanitize.js';
import { createS3, presignPut } from '../lib/s3.js';
import type { Env } from '../lib/env.js';
import { routeString } from '../lib/routeParams.js';
import { asyncHandler, HttpError } from '../middleware/errors.js';
import { requireStaff, type RequestWithUser } from '../middleware/dbUser.js';

const pagination = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export function createAdminRouter(env: Env) {
  const router = Router();
  router.use(requireStaff);

  router.get(
    '/dashboard',
    asyncHandler(async (_req, res) => {
      const [posts, pages, products, orders, submissions, users] = await Promise.all([
        prisma.post.count(),
        prisma.page.count(),
        prisma.product.count(),
        prisma.order.count(),
        prisma.formSubmission.count(),
        prisma.user.count(),
      ]);
      res.json({ posts, pages, products, orders, submissions, users });
    })
  );

  router.get(
    '/posts',
    asyncHandler(async (req, res) => {
      const q = pagination.parse(req.query);
      const [items, total] = await Promise.all([
        prisma.post.findMany({
          skip: (q.page - 1) * q.pageSize,
          take: q.pageSize,
          orderBy: { updatedAt: 'desc' },
          include: { category: true, author: true },
        }),
        prisma.post.count(),
      ]);
      res.json({ items, total, page: q.page, pageSize: q.pageSize });
    })
  );

  const postWrite = z.object({
    slug: z.string().min(1).max(200),
    title: z.string().min(1),
    excerpt: z.string().optional(),
    body: z.string().min(1),
    status: z.nativeEnum(ContentStatus).default(ContentStatus.DRAFT),
    publishedAt: z.coerce.date().optional().nullable(),
    categoryId: z.string().optional().nullable(),
    authorId: z.string().optional().nullable(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    canonicalUrl: z.string().url().optional().nullable(),
    tagIds: z.array(z.string()).optional(),
  });

  router.post(
    '/posts',
    asyncHandler(async (req, res) => {
      const body = postWrite.parse(req.body);
      const { tagIds, ...rest } = body;
      const post = await prisma.post.create({
        data: {
          ...rest,
          body: sanitizeHtml(rest.body),
          excerpt: rest.excerpt ? sanitizeHtml(rest.excerpt) : undefined,
          tags:
            tagIds && tagIds.length > 0
              ? { create: tagIds.map((tagId) => ({ tagId })) }
              : undefined,
        },
      });
      res.status(201).json(post);
    })
  );

  router.patch(
    '/posts/:id',
    asyncHandler(async (req, res) => {
      const body = postWrite.partial().parse(req.body);
      const { tagIds, ...rest } = body;
      if (rest.body) rest.body = sanitizeHtml(rest.body);
      if (rest.excerpt) rest.excerpt = sanitizeHtml(rest.excerpt);
      const postId = routeString(req.params.id);
      if (tagIds !== undefined) {
        await prisma.postTag.deleteMany({ where: { postId } });
        if (tagIds.length) {
          await prisma.postTag.createMany({
            data: tagIds.map((id) => ({ postId, tagId: id })),
            skipDuplicates: true,
          });
        }
      }
      const post = await prisma.post.update({
        where: { id: postId },
        data: rest,
      });
      res.json(post);
    })
  );

  router.delete(
    '/posts/:id',
    asyncHandler(async (req, res) => {
      await prisma.post.delete({ where: { id: routeString(req.params.id) } });
      res.json({ ok: true });
    })
  );

  router.get(
    '/pages',
    asyncHandler(async (req, res) => {
      const q = pagination.parse(req.query);
      const [items, total] = await Promise.all([
        prisma.page.findMany({
          skip: (q.page - 1) * q.pageSize,
          take: q.pageSize,
          orderBy: { updatedAt: 'desc' },
        }),
        prisma.page.count(),
      ]);
      res.json({ items, total, page: q.page, pageSize: q.pageSize });
    })
  );

  const pageWrite = z.object({
    slug: z.string().min(1),
    title: z.string().min(1),
    body: z.string().min(1),
    status: z.nativeEnum(ContentStatus).default(ContentStatus.DRAFT),
    publishedAt: z.coerce.date().optional().nullable(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    canonicalUrl: z.string().url().optional().nullable(),
  });

  router.post(
    '/pages',
    asyncHandler(async (req, res) => {
      const body = pageWrite.parse(req.body);
      const page = await prisma.page.create({
        data: { ...body, body: sanitizeHtml(body.body) },
      });
      res.status(201).json(page);
    })
  );

  router.patch(
    '/pages/:id',
    asyncHandler(async (req, res) => {
      const body = pageWrite.partial().parse(req.body);
      if (body.body) body.body = sanitizeHtml(body.body);
      const page = await prisma.page.update({
        where: { id: routeString(req.params.id) },
        data: body,
      });
      res.json(page);
    })
  );

  router.get(
    '/categories',
    asyncHandler(async (_req, res) => {
      const items = await prisma.category.findMany({ orderBy: { name: 'asc' } });
      res.json({ items });
    })
  );

  router.post(
    '/categories',
    asyncHandler(async (req, res) => {
      const body = z
        .object({ slug: z.string().min(1), name: z.string().min(1), description: z.string().optional() })
        .parse(req.body);
      const c = await prisma.category.create({ data: body });
      res.status(201).json(c);
    })
  );

  router.get(
    '/tags',
    asyncHandler(async (_req, res) => {
      const items = await prisma.tag.findMany({ orderBy: { name: 'asc' } });
      res.json({ items });
    })
  );

  router.post(
    '/tags',
    asyncHandler(async (req, res) => {
      const body = z.object({ slug: z.string().min(1), name: z.string().min(1) }).parse(req.body);
      const t = await prisma.tag.create({ data: body });
      res.status(201).json(t);
    })
  );

  router.get(
    '/products',
    asyncHandler(async (req, res) => {
      const q = pagination.parse(req.query);
      const [items, total] = await Promise.all([
        prisma.product.findMany({
          skip: (q.page - 1) * q.pageSize,
          take: q.pageSize,
          orderBy: { updatedAt: 'desc' },
        }),
        prisma.product.count(),
      ]);
      res.json({ items, total, page: q.page, pageSize: q.pageSize });
    })
  );

  const productWrite = z.object({
    slug: z.string().min(1),
    title: z.string().min(1),
    description: z.string().optional(),
    body: z.string().optional(),
    priceCents: z.coerce.number().int().min(0),
    currency: z.string().default('usd'),
    stripePriceId: z.string().optional().nullable(),
    digital: z.boolean().default(true),
    inventory: z.coerce.number().int().optional().nullable(),
    status: z.nativeEnum(ProductStatus).default(ProductStatus.DRAFT),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
  });

  router.post(
    '/products',
    asyncHandler(async (req, res) => {
      const body = productWrite.parse(req.body);
      const p = await prisma.product.create({
        data: {
          ...body,
          description: body.description ? sanitizeHtml(body.description) : undefined,
          body: body.body ? sanitizeHtml(body.body) : undefined,
        },
      });
      res.status(201).json(p);
    })
  );

  router.patch(
    '/products/:id',
    asyncHandler(async (req, res) => {
      const body = productWrite.partial().parse(req.body);
      if (body.description) body.description = sanitizeHtml(body.description);
      if (body.body) body.body = sanitizeHtml(body.body);
      const p = await prisma.product.update({
        where: { id: routeString(req.params.id) },
        data: body,
      });
      res.json(p);
    })
  );

  router.get(
    '/orders',
    asyncHandler(async (req, res) => {
      const q = pagination.parse(req.query);
      const [items, total] = await Promise.all([
        prisma.order.findMany({
          skip: (q.page - 1) * q.pageSize,
          take: q.pageSize,
          orderBy: { createdAt: 'desc' },
          include: { user: true, items: { include: { product: true } } },
        }),
        prisma.order.count(),
      ]);
      res.json({ items, total, page: q.page, pageSize: q.pageSize });
    })
  );

  router.patch(
    '/orders/:id',
    asyncHandler(async (req, res) => {
      const body = z.object({ status: z.nativeEnum(OrderStatus) }).parse(req.body);
      const o = await prisma.order.update({
        where: { id: routeString(req.params.id) },
        data: body,
      });
      res.json(o);
    })
  );

  router.get(
    '/users',
    asyncHandler(async (req, res) => {
      const q = pagination.parse(req.query);
      const [items, total] = await Promise.all([
        prisma.user.findMany({
          skip: (q.page - 1) * q.pageSize,
          take: q.pageSize,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.user.count(),
      ]);
      res.json({ items, total, page: q.page, pageSize: q.pageSize });
    })
  );

  router.patch(
    '/users/:id',
    asyncHandler(async (req: RequestWithUser, res) => {
      const body = z.object({ role: z.nativeEnum(UserRole) }).parse(req.body);
      const userId = routeString(req.params.id);
      if (req.dbUser?.id === userId && body.role !== req.dbUser.role) {
        throw new HttpError(400, 'Cannot change your own role here');
      }
      const u = await prisma.user.update({ where: { id: userId }, data: { role: body.role } });
      res.json(u);
    })
  );

  router.get(
    '/subscriptions',
    asyncHandler(async (req, res) => {
      const q = pagination.parse(req.query);
      const [items, total] = await Promise.all([
        prisma.subscription.findMany({
          skip: (q.page - 1) * q.pageSize,
          take: q.pageSize,
          orderBy: { updatedAt: 'desc' },
          include: { user: true, plan: true },
        }),
        prisma.subscription.count(),
      ]);
      res.json({ items, total, page: q.page, pageSize: q.pageSize });
    })
  );

  router.get(
    '/forms',
    asyncHandler(async (req, res) => {
      const q = z
        .object({
          page: z.coerce.number().int().min(1).default(1),
          pageSize: z.coerce.number().int().min(1).max(100).default(20),
          type: z.nativeEnum(FormType).optional(),
        })
        .parse(req.query);
      const where = q.type ? { type: q.type } : {};
      const [items, total] = await Promise.all([
        prisma.formSubmission.findMany({
          where,
          skip: (q.page - 1) * q.pageSize,
          take: q.pageSize,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.formSubmission.count({ where }),
      ]);
      res.json({ items, total, page: q.page, pageSize: q.pageSize });
    })
  );

  router.get(
    '/navigation',
    asyncHandler(async (_req, res) => {
      const items = await prisma.navigationMenu.findMany();
      res.json({ items });
    })
  );

  router.put(
    '/navigation/:key',
    asyncHandler(async (req, res) => {
      const body = z
        .object({
          label: z.string(),
          items: z.array(z.object({ label: z.string(), href: z.string() })).default([]),
        })
        .parse(req.body);
      const key = routeString(req.params.key);
      const menu = await prisma.navigationMenu.upsert({
        where: { key },
        update: { label: body.label, items: body.items as Prisma.InputJsonValue },
        create: { key, label: body.label, items: body.items as Prisma.InputJsonValue },
      });
      res.json(menu);
    })
  );

  router.get(
    '/settings',
    asyncHandler(async (_req, res) => {
      const items = await prisma.siteSetting.findMany();
      res.json({ items });
    })
  );

  router.put(
    '/settings/:key',
    asyncHandler(async (req, res) => {
      const body = z.object({ value: z.record(z.string(), z.unknown()) }).parse(req.body);
      const key = routeString(req.params.key);
      const value = body.value as Prisma.InputJsonValue;
      const s = await prisma.siteSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
      res.json(s);
    })
  );

  router.get(
    '/media',
    asyncHandler(async (req, res) => {
      const q = pagination.parse(req.query);
      const [items, total] = await Promise.all([
        prisma.mediaAsset.findMany({
          skip: (q.page - 1) * q.pageSize,
          take: q.pageSize,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.mediaAsset.count(),
      ]);
      res.json({ items, total, page: q.page, pageSize: q.pageSize });
    })
  );

  router.post(
    '/media/presign',
    asyncHandler(async (req, res) => {
      const s3 = createS3(env);
      if (!s3 || !env.S3_BUCKET) throw new HttpError(503, 'S3 not configured');
      const body = z
        .object({
          filename: z.string().min(1).max(200),
          contentType: z.string().min(1).max(200),
          sizeBytes: z.coerce.number().int().max(15_000_000),
        })
        .parse(req.body);
      const key = `uploads/${Date.now()}-${body.filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const { uploadUrl, publicUrl } = await presignPut(
        s3,
        env.S3_BUCKET,
        key,
        body.contentType,
        env.S3_PUBLIC_BASE_URL
      );
      res.json({ uploadUrl, publicUrl, key });
    })
  );

  router.post(
    '/media/complete',
    asyncHandler(async (req, res) => {
      const body = z
        .object({
          key: z.string().min(1),
          url: z.string().url(),
          mimeType: z.string(),
          sizeBytes: z.coerce.number().int(),
          altText: z.string().optional(),
          title: z.string().optional(),
        })
        .parse(req.body);
      const asset = await prisma.mediaAsset.create({ data: body });
      res.status(201).json(asset);
    })
  );

  router.get(
    '/roles',
    asyncHandler(async (_req, res) => {
      res.json({ items: Object.values(UserRole) });
    })
  );

  return router;
}

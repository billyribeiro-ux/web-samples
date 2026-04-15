import { Router } from 'express';
import { z } from 'zod';
import { ContentStatus, ProductStatus } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { routeString } from '../lib/routeParams.js';
import { sanitizeHtml } from '../lib/sanitize.js';
import { asyncHandler } from '../middleware/errors.js';
import { attachDbUserOptional, type RequestWithUser } from '../middleware/dbUser.js';
import { searchAll } from '../services/search.js';

const listQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
});

export const publicRouter = Router();
publicRouter.use(attachDbUserOptional);

publicRouter.get(
  '/health',
  asyncHandler(async (_req, res) => {
    res.json({ ok: true, time: new Date().toISOString() });
  })
);

publicRouter.get(
  '/site',
  asyncHandler(async (_req, res) => {
    const setting = await prisma.siteSetting.findUnique({ where: { key: 'site' } });
    const header = await prisma.navigationMenu.findUnique({ where: { key: 'header' } });
    const footer = await prisma.navigationMenu.findUnique({ where: { key: 'footer' } });
    res.json({
      site: setting?.value ?? {},
      navigation: { header: header?.items ?? [], footer: footer?.items ?? [] },
    });
  })
);

publicRouter.get(
  '/pages/:slug',
  asyncHandler(async (req, res) => {
    const slug = routeString(req.params.slug);
    const page = await prisma.page.findFirst({
      where: { slug, status: ContentStatus.PUBLISHED },
    });
    if (!page) return res.status(404).json({ error: 'Not found' });
    res.json({ ...page, body: sanitizeHtml(page.body) });
  })
);

publicRouter.get(
  '/posts',
  asyncHandler(async (req, res) => {
    const q = listQuery.parse(req.query);
    const where = { status: ContentStatus.PUBLISHED };
    const [items, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
        include: { category: true, author: true, tags: { include: { tag: true } } },
      }),
      prisma.post.count({ where }),
    ]);
    res.json({
      items: items.map((p) => ({ ...p, body: undefined, excerpt: p.excerpt })),
      total,
      page: q.page,
      pageSize: q.pageSize,
    });
  })
);

publicRouter.get(
  '/posts/:slug',
  asyncHandler(async (req, res) => {
    const slug = routeString(req.params.slug);
    const post = await prisma.post.findFirst({
      where: { slug, status: ContentStatus.PUBLISHED },
      include: { category: true, author: true, tags: { include: { tag: true } } },
    });
    if (!post) return res.status(404).json({ error: 'Not found' });
    const relatedWhere =
      post.categoryId != null
        ? {
            status: ContentStatus.PUBLISHED,
            categoryId: post.categoryId,
            NOT: { id: post.id },
          }
        : { status: ContentStatus.PUBLISHED, NOT: { id: post.id } };
    const related = await prisma.post.findMany({
      where: relatedWhere,
      take: 3,
      orderBy: { publishedAt: 'desc' },
      select: { id: true, slug: true, title: true, excerpt: true, readingMinutes: true },
    });
    res.json({ ...post, body: sanitizeHtml(post.body), related });
  })
);

publicRouter.get(
  '/categories/:slug',
  asyncHandler(async (req, res) => {
    const slug = routeString(req.params.slug);
    const cat = await prisma.category.findUnique({ where: { slug } });
    if (!cat) return res.status(404).json({ error: 'Not found' });
    const q = listQuery.parse(req.query);
    const where = { status: ContentStatus.PUBLISHED, categoryId: cat.id };
    const [items, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
        include: { author: true },
      }),
      prisma.post.count({ where }),
    ]);
    res.json({ category: cat, items, total, page: q.page, pageSize: q.pageSize });
  })
);

publicRouter.get(
  '/tags/:slug',
  asyncHandler(async (req, res) => {
    const slug = routeString(req.params.slug);
    const tag = await prisma.tag.findUnique({ where: { slug } });
    if (!tag) return res.status(404).json({ error: 'Not found' });
    const q = listQuery.parse(req.query);
    const where = {
      status: ContentStatus.PUBLISHED,
      tags: { some: { tagId: tag.id } },
    };
    const [items, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
        include: { author: true, category: true },
      }),
      prisma.post.count({ where }),
    ]);
    res.json({ tag, items, total, page: q.page, pageSize: q.pageSize });
  })
);

publicRouter.get(
  '/products',
  asyncHandler(async (req, res) => {
    const q = listQuery.parse(req.query);
    const where = { status: ProductStatus.ACTIVE };
    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
        include: { featuredImage: true },
      }),
      prisma.product.count({ where }),
    ]);
    res.json({ items, total, page: q.page, pageSize: q.pageSize });
  })
);

publicRouter.get(
  '/products/:slug',
  asyncHandler(async (req, res) => {
    const slug = routeString(req.params.slug);
    const product = await prisma.product.findFirst({
      where: { slug, status: ProductStatus.ACTIVE },
      include: { featuredImage: true },
    });
    if (!product) return res.status(404).json({ error: 'Not found' });
    res.json({
      ...product,
      body: product.body ? sanitizeHtml(product.body) : null,
      description: product.description ? sanitizeHtml(product.description) : null,
    });
  })
);

publicRouter.get(
  '/plans',
  asyncHandler(async (_req, res) => {
    const plans = await prisma.plan.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
    });
    res.json({ items: plans });
  })
);

publicRouter.get(
  '/search',
  asyncHandler(async (req, res) => {
    const q = z.string().min(1).max(200).safeParse(req.query.q);
    if (!q.success) return res.status(400).json({ error: 'Missing q' });
    const hits = await searchAll(prisma, q.data, 20);
    res.json({ hits });
  })
);

publicRouter.get(
  '/gated/:slug',
  asyncHandler(async (req: RequestWithUser, res) => {
    const slug = routeString(req.params.slug);
    const rule = await prisma.gatedContentRule.findFirst({
      where: { slug, published: true },
    });
    if (!rule) return res.status(404).json({ error: 'Not found' });
    const user = req.dbUser;
    const order = ['FREE_USER', 'MEMBER', 'EDITOR', 'ADMIN', 'SUPER_ADMIN'] as const;
    const min = order.indexOf(rule.minRole);
    const current = user ? order.indexOf(user.role) : -1;
    if (current < min) {
      return res.status(403).json({ error: 'Members only', minRole: rule.minRole });
    }
    res.json({ ...rule, body: sanitizeHtml(rule.body) });
  })
);

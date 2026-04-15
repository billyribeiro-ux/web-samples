import { Router } from "express";
import { paramStr } from "../lib/params.js";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../lib/errors.js";

export const publicRouter = Router();

publicRouter.get("/nav/:key", async (req, res, next) => {
  try {
    const menu = await prisma.navigationMenu.findUnique({
      where: { key: paramStr(req.params.key) },
      include: { items: { orderBy: { sortOrder: "asc" } } },
    });
    if (!menu) return res.json({ items: [] });
    res.json({ key: menu.key, name: menu.name, items: menu.items });
  } catch (e) {
    next(e);
  }
});

publicRouter.get("/settings/:key", async (req, res, next) => {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: paramStr(req.params.key) } });
    res.json(row?.value ?? null);
  } catch (e) {
    next(e);
  }
});

publicRouter.get("/pages/:slug", async (req, res, next) => {
  try {
    const page = await prisma.page.findUnique({ where: { slug: paramStr(req.params.slug) } });
    if (!page || !page.published) return next(new HttpError(404, "Not found"));
    res.json(page);
  } catch (e) {
    next(e);
  }
});

publicRouter.get("/posts", async (req, res, next) => {
  try {
    const take = Math.min(Number(req.query.take ?? 12) || 12, 50);
    const skip = Number(req.query.skip ?? 0) || 0;
    const category = typeof req.query.category === "string" ? req.query.category : undefined;
    const tag = typeof req.query.tag === "string" ? req.query.tag : undefined;

    const where = {
      status: "PUBLISHED" as const,
      ...(category
        ? {
            categories: {
              some: { category: { slug: category } },
            },
          }
        : {}),
      ...(tag
        ? {
            tags: { some: { tag: { slug: tag } } },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        take,
        skip,
        include: {
          author: true,
          featuredImage: true,
          categories: { include: { category: true } },
          tags: { include: { tag: true } },
        },
      }),
      prisma.post.count({ where }),
    ]);
    res.json({ items, total, take, skip });
  } catch (e) {
    next(e);
  }
});

publicRouter.get("/posts/:slug", async (req, res, next) => {
  try {
    const post = await prisma.post.findFirst({
      where: { slug: paramStr(req.params.slug), status: "PUBLISHED" },
      include: {
        author: true,
        featuredImage: true,
        ogImage: true,
        categories: { include: { category: true } },
        tags: { include: { tag: true } },
      },
    });
    if (!post) return next(new HttpError(404, "Not found"));

    const related = await prisma.post.findMany({
      where: {
        status: "PUBLISHED",
        id: { not: post.id },
        categories: {
          some: {
            categoryId: { in: post.categories.map((c: { categoryId: string }) => c.categoryId) },
          },
        },
      },
      take: 4,
      include: { featuredImage: true, categories: { include: { category: true } } },
    });

    res.json({ post, related });
  } catch (e) {
    next(e);
  }
});

publicRouter.get("/products", async (req, res, next) => {
  try {
    const take = Math.min(Number(req.query.take ?? 24) || 24, 100);
    const skip = Number(req.query.skip ?? 0) || 0;
    const category = typeof req.query.category === "string" ? req.query.category : undefined;
    const where = {
      published: true,
      ...(category
        ? {
            categories: {
              some: { category: { slug: category } },
            },
          }
        : {}),
    };
    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take,
        skip,
        include: { featuredImage: true, categories: { include: { category: true } } },
      }),
      prisma.product.count({ where }),
    ]);
    res.json({ items, total, take, skip });
  } catch (e) {
    next(e);
  }
});

publicRouter.get("/products/:slug", async (req, res, next) => {
  try {
    const product = await prisma.product.findFirst({
      where: { slug: paramStr(req.params.slug), published: true },
      include: { featuredImage: true, categories: { include: { category: true } } },
    });
    if (!product) return next(new HttpError(404, "Not found"));
    res.json(product);
  } catch (e) {
    next(e);
  }
});

publicRouter.get("/plans", async (_req, res, next) => {
  try {
    const plans = await prisma.plan.findMany({ orderBy: { priceMonthlyCents: "asc" } });
    res.json(plans);
  } catch (e) {
    next(e);
  }
});

publicRouter.get("/categories", async (_req, res, next) => {
  try {
    const items = await prisma.category.findMany({ orderBy: { name: "asc" } });
    res.json(items);
  } catch (e) {
    next(e);
  }
});

publicRouter.get("/tags", async (_req, res, next) => {
  try {
    const items = await prisma.tag.findMany({ orderBy: { name: "asc" } });
    res.json(items);
  } catch (e) {
    next(e);
  }
});

publicRouter.get("/product-categories", async (_req, res, next) => {
  try {
    const items = await prisma.productCategory.findMany({ orderBy: { name: "asc" } });
    res.json(items);
  } catch (e) {
    next(e);
  }
});

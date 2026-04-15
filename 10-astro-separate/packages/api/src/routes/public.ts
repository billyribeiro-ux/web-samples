import { Hono } from "hono";
import { PostStatus, PageStatus, ProductStatus } from "@repo/db";
import { prisma } from "@repo/db";
import { ApiError } from "../lib/errors.js";

const postSelect = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  publishedAt: true,
  readingMinutes: true,
  seoTitle: true,
  seoDescription: true,
  canonicalUrl: true,
  ogTitle: true,
  ogDescription: true,
  twitterCard: true,
  createdAt: true,
  updatedAt: true,
  author: { select: { id: true, name: true, slug: true, bio: true } },
  featuredImage: { select: { url: true, alt: true } },
  categories: { include: { category: { select: { id: true, name: true, slug: true } } } },
  tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
} as const;

export const publicRoutes = new Hono()
  .get("/settings/brand", async (c) => {
    const row = await prisma.siteSetting.findUnique({ where: { key: "brand" } });
    return c.json({ brand: row?.value ?? {} });
  })
  .get("/settings/homepage", async (c) => {
    const row = await prisma.siteSetting.findUnique({ where: { key: "homepage" } });
    return c.json({ homepage: row?.value ?? {} });
  })
  .get("/navigation/:name", async (c) => {
    const name = c.req.param("name").toUpperCase();
    const menu = await prisma.navigationMenu.findFirst({
      where: { name },
      include: { items: { orderBy: { sortOrder: "asc" } } },
    });
    return c.json({ menu });
  })
  .get("/posts", async (c) => {
    const take = Math.min(Number(c.req.query("take") ?? "20"), 50);
    const posts = await prisma.post.findMany({
      where: { status: PostStatus.PUBLISHED },
      orderBy: { publishedAt: "desc" },
      take,
      select: postSelect,
    });
    return c.json({ posts });
  })
  .get("/posts/:slug", async (c) => {
    const slug = c.req.param("slug");
    const post = await prisma.post.findFirst({
      where: { slug, status: PostStatus.PUBLISHED },
      select: { ...postSelect, body: true },
    });
    if (!post) throw new ApiError(404, "Not found", "NOT_FOUND");
    return c.json({ post });
  })
  .get("/pages/:slug", async (c) => {
    const slug = c.req.param("slug");
    const page = await prisma.page.findFirst({
      where: { slug, status: PageStatus.PUBLISHED },
    });
    if (!page) throw new ApiError(404, "Not found", "NOT_FOUND");
    return c.json({ page });
  })
  .get("/categories/:slug", async (c) => {
    const slug = c.req.param("slug");
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        posts: {
          where: { post: { status: PostStatus.PUBLISHED } },
          include: { post: { select: postSelect } },
        },
      },
    });
    if (!category) throw new ApiError(404, "Not found", "NOT_FOUND");
    return c.json({ category });
  })
  .get("/tags/:slug", async (c) => {
    const slug = c.req.param("slug");
    const tag = await prisma.tag.findUnique({
      where: { slug },
      include: {
        posts: {
          where: { post: { status: PostStatus.PUBLISHED } },
          include: { post: { select: postSelect } },
        },
      },
    });
    if (!tag) throw new ApiError(404, "Not found", "NOT_FOUND");
    return c.json({ tag });
  })
  .get("/products", async (c) => {
    const products = await prisma.product.findMany({
      where: { status: ProductStatus.ACTIVE },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        priceCents: true,
        currency: true,
        type: true,
        featuredImage: { select: { url: true, alt: true } },
        categories: { include: { category: { select: { name: true, slug: true } } } },
      },
    });
    return c.json({ products });
  })
  .get("/products/:slug", async (c) => {
    const slug = c.req.param("slug");
    const product = await prisma.product.findFirst({
      where: { slug, status: ProductStatus.ACTIVE },
      include: {
        featuredImage: true,
        categories: { include: { category: true } },
        tags: { include: { tag: true } },
      },
    });
    if (!product) throw new ApiError(404, "Not found", "NOT_FOUND");
    return c.json({ product });
  })
  .get("/plans", async (c) => {
    const plans = await prisma.plan.findMany({
      where: { active: true },
      orderBy: { amountMonthlyCents: "asc" },
    });
    return c.json({ plans });
  });

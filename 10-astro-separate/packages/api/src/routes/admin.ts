import { Hono } from "hono";
import { z } from "zod";
import {
  FormSubmissionType,
  PageStatus,
  PostStatus,
  ProductStatus,
  ProductType,
  SessionScope,
} from "@repo/db";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { prisma } from "@repo/db";
import { config } from "../lib/config.js";
import { ApiError } from "../lib/errors.js";
import { randomToken } from "../lib/token.js";
import { loadSession } from "../middleware/session.js";
import { requireAdminPermission } from "../middleware/guards.js";
import type { AppEnv } from "../types.js";

const postWrite = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  excerpt: z.string().optional(),
  body: z.string().min(1),
  status: z.nativeEnum(PostStatus),
  publishedAt: z.string().datetime().optional().nullable(),
  authorId: z.string().optional().nullable(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  canonicalUrl: z.string().optional().nullable(),
});

const pageWrite = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  body: z.string().min(1),
  status: z.nativeEnum(PageStatus),
  publishedAt: z.string().datetime().optional().nullable(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  canonicalUrl: z.string().optional().nullable(),
});

const productWrite = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  body: z.string().optional(),
  priceCents: z.number().int().nonnegative(),
  currency: z.string().min(3).max(3).default("usd"),
  type: z.nativeEnum(ProductType).default(ProductType.DIGITAL),
  status: z.nativeEnum(ProductStatus).default(ProductStatus.DRAFT),
  inventory: z.number().int().optional().nullable(),
  stripePriceId: z.string().optional().nullable(),
});

export const adminRoutes = new Hono<AppEnv>();
adminRoutes.use("*", loadSession(SessionScope.ADMIN));

adminRoutes.get("/dashboard", requireAdminPermission("admin.dashboard"), async (c) => {
  const [posts, pages, orders, leads, users] = await Promise.all([
    prisma.post.count(),
    prisma.page.count(),
    prisma.order.count(),
    prisma.formSubmission.count(),
    prisma.user.count(),
  ]);
  return c.json({ counts: { posts, pages, orders, leads, users } });
});

adminRoutes.get("/posts", requireAdminPermission("admin.posts"), async (c) => {
  const q = c.req.query("q")?.trim();
  const posts = await prisma.post.findMany({
    where: q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { slug: { contains: q, mode: "insensitive" } },
          ],
        }
      : {},
    orderBy: { updatedAt: "desc" },
    take: 200,
    include: { author: true },
  });
  return c.json({ posts });
});

adminRoutes.post("/posts", requireAdminPermission("admin.posts"), async (c) => {
  const body = postWrite.parse(await c.req.json());
  const post = await prisma.post.create({
    data: {
      slug: body.slug,
      title: body.title,
      excerpt: body.excerpt,
      body: body.body,
      status: body.status,
      publishedAt: body.publishedAt ? new Date(body.publishedAt as string) : null,
      authorId: body.authorId ?? null,
      seoTitle: body.seoTitle ?? undefined,
      seoDescription: body.seoDescription ?? undefined,
      canonicalUrl: body.canonicalUrl ?? undefined,
    },
  });
  return c.json({ post });
});

adminRoutes.patch("/posts/:id", requireAdminPermission("admin.posts"), async (c) => {
  const id = c.req.param("id");
  const body = postWrite.partial().parse(await c.req.json());
  const post = await prisma.post.update({
    where: { id },
    data: {
      ...(body.slug !== undefined ? { slug: body.slug } : {}),
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.excerpt !== undefined ? { excerpt: body.excerpt } : {}),
      ...(body.body !== undefined ? { body: body.body } : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(body.publishedAt !== undefined
        ? { publishedAt: body.publishedAt ? new Date(body.publishedAt as string) : null }
        : {}),
      ...(body.authorId !== undefined ? { authorId: body.authorId } : {}),
      ...(body.seoTitle !== undefined ? { seoTitle: body.seoTitle } : {}),
      ...(body.seoDescription !== undefined ? { seoDescription: body.seoDescription } : {}),
      ...(body.canonicalUrl !== undefined ? { canonicalUrl: body.canonicalUrl } : {}),
    },
  });
  return c.json({ post });
});

adminRoutes.delete("/posts/:id", requireAdminPermission("admin.posts"), async (c) => {
  await prisma.post.delete({ where: { id: c.req.param("id") } });
  return c.json({ ok: true });
});

adminRoutes.get("/pages", requireAdminPermission("admin.pages"), async (c) => {
  const pages = await prisma.page.findMany({ orderBy: { updatedAt: "desc" }, take: 200 });
  return c.json({ pages });
});

adminRoutes.post("/pages", requireAdminPermission("admin.pages"), async (c) => {
  const body = pageWrite.parse(await c.req.json());
  const page = await prisma.page.create({
    data: {
      slug: body.slug,
      title: body.title,
      body: body.body,
      status: body.status,
      publishedAt: body.publishedAt ? new Date(body.publishedAt as string) : null,
      seoTitle: body.seoTitle ?? undefined,
      seoDescription: body.seoDescription ?? undefined,
      canonicalUrl: body.canonicalUrl ?? undefined,
    },
  });
  return c.json({ page });
});

adminRoutes.patch("/pages/:id", requireAdminPermission("admin.pages"), async (c) => {
  const id = c.req.param("id");
  const body = pageWrite.partial().parse(await c.req.json());
  const page = await prisma.page.update({
    where: { id },
    data: {
      ...(body.slug !== undefined ? { slug: body.slug } : {}),
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.body !== undefined ? { body: body.body } : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(body.publishedAt !== undefined
        ? { publishedAt: body.publishedAt ? new Date(body.publishedAt as string) : null }
        : {}),
      ...(body.seoTitle !== undefined ? { seoTitle: body.seoTitle } : {}),
      ...(body.seoDescription !== undefined ? { seoDescription: body.seoDescription } : {}),
      ...(body.canonicalUrl !== undefined ? { canonicalUrl: body.canonicalUrl } : {}),
    },
  });
  return c.json({ page });
});

adminRoutes.get("/categories", requireAdminPermission("admin.categories"), async (c) => {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return c.json({ categories });
});

adminRoutes.post("/categories", requireAdminPermission("admin.categories"), async (c) => {
  const body = z
    .object({ name: z.string().min(1), slug: z.string().min(1), description: z.string().optional() })
    .parse(await c.req.json());
  const category = await prisma.category.create({ data: body });
  return c.json({ category });
});

adminRoutes.get("/tags", requireAdminPermission("admin.tags"), async (c) => {
  const tags = await prisma.tag.findMany({ orderBy: { name: "asc" } });
  return c.json({ tags });
});

adminRoutes.post("/tags", requireAdminPermission("admin.tags"), async (c) => {
  const body = z.object({ name: z.string().min(1), slug: z.string().min(1) }).parse(await c.req.json());
  const tag = await prisma.tag.create({ data: body });
  return c.json({ tag });
});

adminRoutes.get("/products", requireAdminPermission("admin.products"), async (c) => {
  const products = await prisma.product.findMany({ orderBy: { updatedAt: "desc" }, take: 200 });
  return c.json({ products });
});

adminRoutes.post("/products", requireAdminPermission("admin.products"), async (c) => {
  const body = productWrite.parse(await c.req.json());
  const product = await prisma.product.create({ data: body });
  return c.json({ product });
});

adminRoutes.patch("/products/:id", requireAdminPermission("admin.products"), async (c) => {
  const id = c.req.param("id");
  const body = productWrite.partial().parse(await c.req.json());
  const product = await prisma.product.update({
    where: { id },
    data: {
      ...(body.slug !== undefined ? { slug: body.slug } : {}),
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.body !== undefined ? { body: body.body } : {}),
      ...(body.priceCents !== undefined ? { priceCents: body.priceCents } : {}),
      ...(body.currency !== undefined ? { currency: body.currency } : {}),
      ...(body.type !== undefined ? { type: body.type } : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(body.inventory !== undefined ? { inventory: body.inventory } : {}),
      ...(body.stripePriceId !== undefined ? { stripePriceId: body.stripePriceId } : {}),
    },
  });
  return c.json({ product });
});

adminRoutes.get("/users", requireAdminPermission("admin.users"), async (c) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      email: true,
      name: true,
      emailVerifiedAt: true,
      createdAt: true,
      roles: { include: { role: { select: { name: true } } } },
    },
  });
  return c.json({ users });
});

adminRoutes.get("/orders", requireAdminPermission("admin.orders"), async (c) => {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { items: { include: { product: true } }, user: { select: { email: true } } },
  });
  return c.json({ orders });
});

adminRoutes.get("/subscriptions", requireAdminPermission("admin.subscriptions"), async (c) => {
  const subscriptions = await prisma.subscription.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { plan: true, user: { select: { email: true } } },
  });
  return c.json({ subscriptions });
});

adminRoutes.get("/forms", requireAdminPermission("admin.forms"), async (c) => {
  const typeRaw = c.req.query("type");
  const type =
    typeRaw && (Object.values(FormSubmissionType) as string[]).includes(typeRaw)
      ? (typeRaw as FormSubmissionType)
      : undefined;
  const submissions = await prisma.formSubmission.findMany({
    where: type ? { type } : {},
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return c.json({ submissions });
});

adminRoutes.get("/navigation", requireAdminPermission("admin.navigation"), async (c) => {
  const menus = await prisma.navigationMenu.findMany({ include: { items: { orderBy: { sortOrder: "asc" } } } });
  return c.json({ menus });
});

adminRoutes.put("/navigation/:menuId", requireAdminPermission("admin.navigation"), async (c) => {
  const menuId = c.req.param("menuId");
  if (!menuId) throw new ApiError(400, "menuId required", "BAD_REQUEST");
  const body = z
    .object({
      items: z.array(z.object({ id: z.string().optional(), label: z.string(), href: z.string(), sortOrder: z.number().int() })),
    })
    .parse(await c.req.json());
  await prisma.navigationItem.deleteMany({ where: { menuId } });
  await prisma.navigationItem.createMany({
    data: body.items.map((i, idx) => ({
      menuId,
      label: i.label,
      href: i.href,
      sortOrder: i.sortOrder ?? idx,
    })),
  });
  const menu = await prisma.navigationMenu.findUnique({
    where: { id: menuId },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });
  return c.json({ menu });
});

adminRoutes.get("/settings", requireAdminPermission("admin.settings"), async (c) => {
  const settings = await prisma.siteSetting.findMany({ orderBy: { key: "asc" } });
  return c.json({ settings });
});

adminRoutes.put("/settings/:key", requireAdminPermission("admin.settings"), async (c) => {
  const key = c.req.param("key");
  if (!key) throw new ApiError(400, "key required", "BAD_REQUEST");
  const body = z.object({ value: z.unknown() }).parse(await c.req.json());
  const row = await prisma.siteSetting.upsert({
    where: { key },
    update: { value: body.value as object },
    create: { key, value: body.value as object },
  });
  return c.json({ setting: row });
});

adminRoutes.get("/roles", requireAdminPermission("admin.roles"), async (c) => {
  const roles = await prisma.role.findMany({ include: { permissions: { include: { permission: true } } } });
  return c.json({ roles });
});

adminRoutes.get("/search", requireAdminPermission("admin.posts"), async (c) => {
  const q = c.req.query("q")?.trim();
  if (!q) return c.json({ hits: [] });
  const hits = await prisma.$queryRaw<{ kind: string; id: string; title: string; slug: string; rank: number }[]>`
    SELECT * FROM (
      SELECT 'post' as kind, id, title, slug,
        ts_rank(to_tsvector('english', title || ' ' || coalesce(excerpt,'') || ' ' || coalesce(body,'')),
          plainto_tsquery('english', ${q})) as rank
      FROM "Post"
      WHERE to_tsvector('english', title || ' ' || coalesce(excerpt,'') || ' ' || coalesce(body,''))
        @@ plainto_tsquery('english', ${q})
      UNION ALL
      SELECT 'product' as kind, id, name as title, slug,
        ts_rank(to_tsvector('english', name || ' ' || coalesce(description,'') || ' ' || coalesce(body,'')),
          plainto_tsquery('english', ${q})) as rank
      FROM "Product"
      WHERE to_tsvector('english', name || ' ' || coalesce(description,'') || ' ' || coalesce(body,''))
        @@ plainto_tsquery('english', ${q})
      UNION ALL
      SELECT 'page' as kind, id, title, slug,
        ts_rank(to_tsvector('english', title || ' ' || coalesce(body,'')),
          plainto_tsquery('english', ${q})) as rank
      FROM "Page"
      WHERE to_tsvector('english', title || ' ' || coalesce(body,''))
        @@ plainto_tsquery('english', ${q})
    ) t
    ORDER BY rank DESC
    LIMIT 50
  `;
  return c.json({ hits });
});

adminRoutes.post("/media/presign", requireAdminPermission("admin.media"), async (c) => {
  const body = z
    .object({
      filename: z.string().min(1),
      mimeType: z.string().min(1),
      bytes: z.number().int().positive().max(20_000_000),
    })
    .parse(await c.req.json());

  if (!config.s3Bucket()) throw new ApiError(503, "Object storage not configured", "S3_DISABLED");

  const key = `uploads/${randomToken(8)}/${body.filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const client = new S3Client({
    region: config.s3Region(),
    endpoint: config.s3Endpoint() || undefined,
    credentials:
      config.s3AccessKey() && config.s3SecretKey()
        ? { accessKeyId: config.s3AccessKey(), secretAccessKey: config.s3SecretKey() }
        : undefined,
    forcePathStyle: Boolean(config.s3Endpoint()),
  });

  const url = await getSignedUrl(
    client,
    new PutObjectCommand({
      Bucket: config.s3Bucket(),
      Key: key,
      ContentType: body.mimeType,
    }),
    { expiresIn: 60 * 10 }
  );

  const base = config.s3PublicBaseUrl();
  if (!base) throw new ApiError(503, "S3_PUBLIC_BASE_URL not configured", "S3_PUBLIC_URL_MISSING");
  const publicUrl = `${base.replace(/\/$/, "")}/${key}`;
  return c.json({ uploadUrl: url, key, publicUrl });
});

adminRoutes.post("/media/complete", requireAdminPermission("admin.media"), async (c) => {
  const u = c.get("authUser")!;
  const body = z
    .object({
      key: z.string().min(1),
      mimeType: z.string().min(1),
      sizeBytes: z.number().int().positive(),
      alt: z.string().optional(),
      title: z.string().optional(),
    })
    .parse(await c.req.json());

  const base = config.s3PublicBaseUrl();
  if (!base) throw new ApiError(503, "S3_PUBLIC_BASE_URL not configured", "S3_PUBLIC_URL_MISSING");
  const publicUrl = `${base.replace(/\/$/, "")}/${body.key}`;
  const asset = await prisma.mediaAsset.create({
    data: {
      key: body.key,
      bucket: config.s3Bucket(),
      url: publicUrl,
      mimeType: body.mimeType,
      sizeBytes: body.sizeBytes,
      alt: body.alt,
      title: body.title,
      uploadedById: u.id,
    },
  });
  return c.json({ asset });
});

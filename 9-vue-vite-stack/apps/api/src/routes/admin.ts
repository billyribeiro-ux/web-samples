import { Router } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { adminPageUpsertSchema, adminPostCreateSchema, adminPostUpdateSchema, adminProductUpsertSchema } from "shared";
import { HttpError } from "../lib/errors.js";
import { paramStr } from "../lib/params.js";
import { prisma } from "../lib/prisma.js";
import { requirePermission } from "../middleware/requirePermission.js";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl as awsGetSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

export const adminRouter = Router();

const audit = async (
  userId: string | undefined,
  action: string,
  entity: string,
  entityId?: string,
  diff?: unknown
) => {
  await prisma.auditLog.create({
    data: { userId, action, entity, entityId, diff: diff as object | undefined },
  });
};

adminRouter.get("/dashboard", requirePermission("admin.access"), async (req, res, next) => {
  try {
    const [posts, orders, leads] = await Promise.all([
      prisma.post.count(),
      prisma.order.count(),
      prisma.formSubmission.count(),
    ]);
    res.json({ counts: { posts, orders, leads } });
  } catch (e) {
    next(e);
  }
});

adminRouter.get("/posts", requirePermission("posts.read"), async (req, res, next) => {
  try {
    const take = Math.min(Number(req.query.take ?? 20) || 20, 100);
    const skip = Number(req.query.skip ?? 0) || 0;
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    const where = q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" as const } },
            { slug: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {};
    const [items, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        take,
        skip,
        include: { author: true },
      }),
      prisma.post.count({ where }),
    ]);
    res.json({ items, total, take, skip });
  } catch (e) {
    next(e);
  }
});

adminRouter.post("/posts", requirePermission("posts.write"), async (req, res, next) => {
  try {
    const parsed = adminPostCreateSchema.safeParse(req.body);
    if (!parsed.success) return next(new HttpError(400, "Invalid input"));
    const d = parsed.data;
    const post = await prisma.post.create({
      data: {
        slug: d.slug,
        title: d.title,
        excerpt: d.excerpt ?? null,
        content: d.content,
        status: d.status,
        publishedAt: d.publishedAt ?? null,
        scheduledFor: d.scheduledFor ?? null,
        readingMinutes: d.readingMinutes ?? 5,
        seoTitle: d.seoTitle ?? null,
        seoDescription: d.seoDescription ?? null,
        canonicalUrl: d.canonicalUrl ?? null,
        authorId: d.authorId ?? null,
        featuredImageId: d.featuredImageId ?? null,
        ogImageId: d.ogImageId ?? null,
        categories: {
          create: (d.categoryIds ?? []).map((id) => ({ categoryId: id })),
        },
        tags: { create: (d.tagIds ?? []).map((id) => ({ tagId: id })) },
      },
    });
    await audit(req.sessionRecord?.user.id, "create", "Post", post.id);
    res.status(201).json(post);
  } catch (e) {
    next(e);
  }
});

adminRouter.put("/posts/:id", requirePermission("posts.write"), async (req, res, next) => {
  try {
    const parsed = adminPostUpdateSchema.safeParse(req.body);
    if (!parsed.success) return next(new HttpError(400, "Invalid input"));
    const d = parsed.data;
    const id = paramStr(req.params.id);
    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) return next(new HttpError(404, "Not found"));

    const post = await prisma.post.update({
      where: { id },
      data: {
        slug: d.slug ?? undefined,
        title: d.title ?? undefined,
        excerpt: d.excerpt === undefined ? undefined : d.excerpt,
        content: d.content ?? undefined,
        status: d.status ?? undefined,
        publishedAt: d.publishedAt === undefined ? undefined : d.publishedAt,
        scheduledFor: d.scheduledFor === undefined ? undefined : d.scheduledFor,
        readingMinutes: d.readingMinutes ?? undefined,
        seoTitle: d.seoTitle === undefined ? undefined : d.seoTitle,
        seoDescription: d.seoDescription === undefined ? undefined : d.seoDescription,
        canonicalUrl: d.canonicalUrl === undefined ? undefined : d.canonicalUrl,
        authorId: d.authorId === undefined ? undefined : d.authorId,
        featuredImageId: d.featuredImageId === undefined ? undefined : d.featuredImageId,
        ogImageId: d.ogImageId === undefined ? undefined : d.ogImageId,
      },
    });

    if (d.categoryIds) {
      await prisma.postCategory.deleteMany({ where: { postId: id } });
      await prisma.postCategory.createMany({
        data: d.categoryIds.map((cid) => ({ postId: id, categoryId: cid })),
      });
    }
    if (d.tagIds) {
      await prisma.postTag.deleteMany({ where: { postId: id } });
      await prisma.postTag.createMany({
        data: d.tagIds.map((tid) => ({ postId: id, tagId: tid })),
      });
    }

    await audit(req.sessionRecord?.user.id, "update", "Post", post.id, d);
    res.json(post);
  } catch (e) {
    next(e);
  }
});

adminRouter.delete("/posts/:id", requirePermission("posts.write"), async (req, res, next) => {
  try {
    const id = paramStr(req.params.id);
    await prisma.post.delete({ where: { id } });
    await audit(req.sessionRecord?.user.id, "delete", "Post", id);
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

adminRouter.get("/pages", requirePermission("pages.read"), async (_req, res, next) => {
  try {
    const items = await prisma.page.findMany({ orderBy: { updatedAt: "desc" } });
    res.json(items);
  } catch (e) {
    next(e);
  }
});

adminRouter.put("/pages/:slug", requirePermission("pages.write"), async (req, res, next) => {
  try {
    const parsed = adminPageUpsertSchema.safeParse({
      ...req.body,
      slug: paramStr(req.params.slug),
    });
    if (!parsed.success) return next(new HttpError(400, "Invalid input"));
    const d = parsed.data;
    const page = await prisma.page.upsert({
      where: { slug: d.slug },
      create: {
        slug: d.slug,
        title: d.title,
        content: d.content,
        blocks:
          d.blocks === undefined || d.blocks === null
            ? undefined
            : (d.blocks as Prisma.InputJsonValue),
        published: d.published ?? true,
        seoTitle: d.seoTitle ?? null,
        seoDescription: d.seoDescription ?? null,
        canonicalUrl: d.canonicalUrl ?? null,
        ogImageId: d.ogImageId ?? null,
      },
      update: {
        title: d.title,
        content: d.content,
        blocks:
          d.blocks === undefined
            ? undefined
            : d.blocks === null
              ? Prisma.JsonNull
              : (d.blocks as Prisma.InputJsonValue),
        published: d.published ?? undefined,
        seoTitle: d.seoTitle === undefined ? undefined : d.seoTitle,
        seoDescription: d.seoDescription === undefined ? undefined : d.seoDescription,
        canonicalUrl: d.canonicalUrl === undefined ? undefined : d.canonicalUrl,
        ogImageId: d.ogImageId === undefined ? undefined : d.ogImageId,
      },
    });
    await audit(req.sessionRecord?.user.id, "upsert", "Page", page.id);
    res.json(page);
  } catch (e) {
    next(e);
  }
});

adminRouter.get("/products", requirePermission("products.read"), async (req, res, next) => {
  try {
    const items = await prisma.product.findMany({
      orderBy: { updatedAt: "desc" },
      include: { featuredImage: true },
    });
    res.json(items);
  } catch (e) {
    next(e);
  }
});

adminRouter.post("/products", requirePermission("products.write"), async (req, res, next) => {
  try {
    const parsed = adminProductUpsertSchema.safeParse(req.body);
    if (!parsed.success) return next(new HttpError(400, "Invalid input"));
    const d = parsed.data;
    const product = await prisma.product.create({
      data: {
        slug: d.slug,
        name: d.name,
        description: d.description,
        priceCents: d.priceCents,
        currency: d.currency,
        type: d.type,
        published: d.published ?? true,
        featuredImageId: d.featuredImageId ?? null,
        categories: {
          create: (d.categoryIds ?? []).map((id) => ({ categoryId: id })),
        },
      },
    });
    await audit(req.sessionRecord?.user.id, "create", "Product", product.id);
    res.status(201).json(product);
  } catch (e) {
    next(e);
  }
});

adminRouter.put("/products/:id", requirePermission("products.write"), async (req, res, next) => {
  try {
    const parsed = adminProductUpsertSchema.partial().safeParse(req.body);
    if (!parsed.success) return next(new HttpError(400, "Invalid input"));
    const d = parsed.data;
    const id = paramStr(req.params.id);
    const product = await prisma.product.update({
      where: { id },
      data: {
        slug: d.slug,
        name: d.name,
        description: d.description,
        priceCents: d.priceCents,
        currency: d.currency,
        type: d.type,
        published: d.published,
        featuredImageId: d.featuredImageId === undefined ? undefined : d.featuredImageId,
      },
    });
    if (d.categoryIds) {
      await prisma.productOnCategory.deleteMany({ where: { productId: id } });
      await prisma.productOnCategory.createMany({
        data: d.categoryIds.map((cid) => ({ productId: id, categoryId: cid })),
      });
    }
    await audit(req.sessionRecord?.user.id, "update", "Product", product.id, d);
    res.json(product);
  } catch (e) {
    next(e);
  }
});

adminRouter.get("/orders", requirePermission("orders.read"), async (_req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { items: { include: { product: true } }, user: true },
    });
    res.json(orders);
  } catch (e) {
    next(e);
  }
});

adminRouter.get("/users", requirePermission("users.read"), async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        createdAt: true,
        roles: { include: { role: true } },
      },
    });
    res.json(users);
  } catch (e) {
    next(e);
  }
});

adminRouter.get("/forms", requirePermission("admin.access"), async (_req, res, next) => {
  try {
    const items = await prisma.formSubmission.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
    res.json(items);
  } catch (e) {
    next(e);
  }
});

adminRouter.get("/settings", requirePermission("settings.read"), async (_req, res, next) => {
  try {
    const rows = await prisma.siteSetting.findMany();
    res.json(Object.fromEntries(rows.map((r: { key: string; value: unknown }) => [r.key, r.value])));
  } catch (e) {
    next(e);
  }
});

adminRouter.put("/settings/:key", requirePermission("settings.write"), async (req, res, next) => {
  try {
    const value = z.unknown().parse(req.body.value);
    const row = await prisma.siteSetting.upsert({
      where: { key: paramStr(req.params.key) },
      create: { key: paramStr(req.params.key), value: value as object },
      update: { value: value as object },
    });
    await audit(req.sessionRecord?.user.id, "upsert", "SiteSetting", row.id);
    res.json(row);
  } catch (e) {
    next(e);
  }
});

adminRouter.post("/media/presign", requirePermission("media.write"), async (req, res, next) => {
  try {
    const parsed = z
      .object({
        filename: z.string().min(1).max(200),
        contentType: z.string().min(1).max(120),
      })
      .safeParse(req.body);
    if (!parsed.success) return next(new HttpError(400, "Invalid input"));

    const bucket = req.env.S3_BUCKET;
    const accessKeyId = req.env.S3_ACCESS_KEY_ID;
    const secretAccessKey = req.env.S3_SECRET_ACCESS_KEY;
    if (!bucket || !accessKeyId || !secretAccessKey) {
      return next(new HttpError(503, "Object storage not configured"));
    }

    const key = `uploads/${randomUUID()}-${parsed.data.filename.replace(/[^a-zA-Z0-9._-]/g, "")}`;
    const client = new S3Client({
      region: req.env.S3_REGION,
      endpoint: req.env.S3_ENDPOINT || undefined,
      forcePathStyle: Boolean(req.env.S3_ENDPOINT),
      credentials: { accessKeyId, secretAccessKey },
    });

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: parsed.data.contentType,
    });

    const uploadUrl = await awsGetSignedUrl(client, command, { expiresIn: 60 * 10 });
    const publicBase = req.env.S3_PUBLIC_BASE_URL?.replace(/\/$/, "");
    const url = publicBase ? `${publicBase}/${key}` : uploadUrl.split("?")[0];

    res.json({ uploadUrl, key, url });
  } catch (e) {
    next(e);
  }
});

adminRouter.post("/media/complete", requirePermission("media.write"), async (req, res, next) => {
  try {
    const parsed = z
      .object({
        key: z.string().min(1),
        url: z.string().url(),
        mime: z.string().min(1),
        size: z.coerce.number().int().min(1),
        alt: z.string().max(500).optional().nullable(),
        title: z.string().max(200).optional().nullable(),
      })
      .safeParse(req.body);
    if (!parsed.success) return next(new HttpError(400, "Invalid input"));
    const asset = await prisma.mediaAsset.create({ data: parsed.data });
    await audit(req.sessionRecord?.user.id, "create", "MediaAsset", asset.id);
    res.status(201).json(asset);
  } catch (e) {
    next(e);
  }
});

adminRouter.get("/categories", requirePermission("posts.read"), async (_req, res, next) => {
  try {
    res.json(await prisma.category.findMany({ orderBy: { name: "asc" } }));
  } catch (e) {
    next(e);
  }
});

adminRouter.get("/tags", requirePermission("posts.read"), async (_req, res, next) => {
  try {
    res.json(await prisma.tag.findMany({ orderBy: { name: "asc" } }));
  } catch (e) {
    next(e);
  }
});

adminRouter.get("/authors", requirePermission("posts.read"), async (_req, res, next) => {
  try {
    res.json(await prisma.author.findMany({ orderBy: { name: "asc" } }));
  } catch (e) {
    next(e);
  }
});

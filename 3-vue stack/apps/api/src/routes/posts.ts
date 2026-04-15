import { Router } from "express";
import { ContentStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { requirePermission, requireUser } from "../middleware/auth.js";

export function postsRouter() {
  const r = Router();

  r.get("/", async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize) || 10));
    const category = typeof req.query.category === "string" ? req.query.category : undefined;
    const tag = typeof req.query.tag === "string" ? req.query.tag : undefined;
    const where = {
      status: ContentStatus.PUBLISHED,
      ...(category
        ? { categories: { some: { category: { slug: category } } } }
        : {}),
      ...(tag ? { tags: { some: { tag: { slug: tag } } } } : {}),
    };
    const [total, items] = await prisma.$transaction([
      prisma.post.count({ where }),
      prisma.post.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          author: true,
          featuredImage: true,
          categories: { include: { category: true } },
          tags: { include: { tag: true } },
        },
      }),
    ]);
    res.json({ total, page, pageSize, items });
  });

  r.get("/slug/:slug", async (req, res) => {
    const post = await prisma.post.findFirst({
      where: { slug: req.params.slug, status: ContentStatus.PUBLISHED },
      include: {
        author: true,
        featuredImage: true,
        categories: { include: { category: true } },
        tags: { include: { tag: true } },
        relatedFrom: { include: { relatedPost: true } },
      },
    });
    if (!post) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(post);
  });

  r.get("/admin/all", requireUser, requirePermission("content:write"), async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 20));
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    const where = q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" as const } },
            { slug: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {};
    const [total, items] = await prisma.$transaction([
      prisma.post.count({ where }),
      prisma.post.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { author: true },
      }),
    ]);
    res.json({ total, page, pageSize, items });
  });

  r.post("/", requireUser, requirePermission("content:write"), async (req, res) => {
    const body = req.body as Record<string, unknown>;
    const post = await prisma.post.create({
      data: {
        slug: String(body.slug),
        title: String(body.title),
        excerpt: body.excerpt != null ? String(body.excerpt) : null,
        body: String(body.body ?? ""),
        status: (body.status as ContentStatus) ?? ContentStatus.DRAFT,
        publishedAt: body.publishedAt ? new Date(String(body.publishedAt)) : null,
        scheduledFor: body.scheduledFor ? new Date(String(body.scheduledFor)) : null,
        readingMinutes: body.readingMinutes != null ? Number(body.readingMinutes) : null,
        authorId: body.authorId != null ? String(body.authorId) : null,
        featuredImageId: body.featuredImageId != null ? String(body.featuredImageId) : null,
        seoTitle: body.seoTitle != null ? String(body.seoTitle) : null,
        seoDescription: body.seoDescription != null ? String(body.seoDescription) : null,
        canonicalUrl: body.canonicalUrl != null ? String(body.canonicalUrl) : null,
      },
    });
    res.status(201).json(post);
  });

  r.patch("/:id", requireUser, requirePermission("content:write"), async (req, res) => {
    const body = req.body as Record<string, unknown>;
    try {
      const post = await prisma.post.update({
        where: { id: String(req.params.id) },
        data: {
          ...(body.slug !== undefined && { slug: String(body.slug) }),
          ...(body.title !== undefined && { title: String(body.title) }),
          ...(body.excerpt !== undefined && { excerpt: body.excerpt != null ? String(body.excerpt) : null }),
          ...(body.body !== undefined && { body: String(body.body) }),
          ...(body.status !== undefined && { status: body.status as ContentStatus }),
          ...(body.publishedAt !== undefined && {
            publishedAt: body.publishedAt ? new Date(String(body.publishedAt)) : null,
          }),
          ...(body.scheduledFor !== undefined && {
            scheduledFor: body.scheduledFor ? new Date(String(body.scheduledFor)) : null,
          }),
          ...(body.readingMinutes !== undefined && {
            readingMinutes: body.readingMinutes != null ? Number(body.readingMinutes) : null,
          }),
          ...(body.authorId !== undefined && { authorId: body.authorId != null ? String(body.authorId) : null }),
          ...(body.featuredImageId !== undefined && {
            featuredImageId: body.featuredImageId != null ? String(body.featuredImageId) : null,
          }),
          ...(body.seoTitle !== undefined && { seoTitle: body.seoTitle != null ? String(body.seoTitle) : null }),
          ...(body.seoDescription !== undefined && {
            seoDescription: body.seoDescription != null ? String(body.seoDescription) : null,
          }),
          ...(body.canonicalUrl !== undefined && {
            canonicalUrl: body.canonicalUrl != null ? String(body.canonicalUrl) : null,
          }),
        },
      });
      res.json(post);
    } catch {
      res.status(404).json({ error: "Not found" });
    }
  });

  r.delete("/:id", requireUser, requirePermission("content:write"), async (req, res) => {
    try {
      await prisma.post.delete({ where: { id: String(req.params.id) } });
      res.status(204).send();
    } catch {
      res.status(404).json({ error: "Not found" });
    }
  });

  return r;
}

import { Router } from "express";
import { ContentStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { requirePermission, requireUser } from "../middleware/auth.js";

export function pagesRouter() {
  const r = Router();

  r.get("/slug/:slug", async (req, res) => {
    const page = await prisma.page.findFirst({
      where: { slug: req.params.slug, status: ContentStatus.PUBLISHED },
      include: { featuredImage: true },
    });
    if (!page) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(page);
  });

  r.get("/admin/all", requireUser, requirePermission("content:write"), async (req, res) => {
    const items = await prisma.page.findMany({ orderBy: { updatedAt: "desc" } });
    res.json({ items });
  });

  r.post("/", requireUser, requirePermission("content:write"), async (req, res) => {
    const body = req.body as Record<string, unknown>;
    const page = await prisma.page.create({
      data: {
        slug: String(body.slug),
        title: String(body.title),
        body: String(body.body ?? ""),
        status: (body.status as ContentStatus) ?? ContentStatus.DRAFT,
        featuredImageId: body.featuredImageId != null ? String(body.featuredImageId) : null,
        seoTitle: body.seoTitle != null ? String(body.seoTitle) : null,
        seoDescription: body.seoDescription != null ? String(body.seoDescription) : null,
        canonicalUrl: body.canonicalUrl != null ? String(body.canonicalUrl) : null,
      },
    });
    res.status(201).json(page);
  });

  r.patch("/:id", requireUser, requirePermission("content:write"), async (req, res) => {
    const body = req.body as Record<string, unknown>;
    try {
      const page = await prisma.page.update({
        where: { id: String(req.params.id) },
        data: {
          ...(body.slug !== undefined && { slug: String(body.slug) }),
          ...(body.title !== undefined && { title: String(body.title) }),
          ...(body.body !== undefined && { body: String(body.body) }),
          ...(body.status !== undefined && { status: body.status as ContentStatus }),
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
      res.json(page);
    } catch {
      res.status(404).json({ error: "Not found" });
    }
  });

  r.delete("/:id", requireUser, requirePermission("content:write"), async (req, res) => {
    try {
      await prisma.page.delete({ where: { id: String(req.params.id) } });
      res.status(204).send();
    } catch {
      res.status(404).json({ error: "Not found" });
    }
  });

  return r;
}

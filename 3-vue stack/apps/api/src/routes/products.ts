import { Router } from "express";
import { ContentStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { requirePermission, requireUser } from "../middleware/auth.js";

export function productsRouter() {
  const r = Router();

  r.get("/", async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize) || 12));
    const category = typeof req.query.category === "string" ? req.query.category : undefined;
    const where = {
      status: ContentStatus.PUBLISHED,
      ...(category
        ? { categories: { some: { category: { slug: category } } } }
        : {}),
    };
    const [total, items] = await prisma.$transaction([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { featuredImage: true, categories: { include: { category: true } } },
      }),
    ]);
    res.json({ total, page, pageSize, items });
  });

  r.get("/slug/:slug", async (req, res) => {
    const product = await prisma.product.findFirst({
      where: { slug: req.params.slug, status: ContentStatus.PUBLISHED },
      include: { featuredImage: true, categories: { include: { category: true } } },
    });
    if (!product) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(product);
  });

  r.get("/admin/all", requireUser, requirePermission("orders:read"), async (req, res) => {
    const items = await prisma.product.findMany({
      orderBy: { updatedAt: "desc" },
      include: { featuredImage: true },
    });
    res.json({ items });
  });

  r.post("/", requireUser, requirePermission("content:write"), async (req, res) => {
    const body = req.body as Record<string, unknown>;
    const product = await prisma.product.create({
      data: {
        slug: String(body.slug),
        name: String(body.name),
        description: String(body.description ?? ""),
        priceCents: Number(body.priceCents ?? 0),
        currency: String(body.currency ?? "usd"),
        status: (body.status as ContentStatus) ?? ContentStatus.DRAFT,
        fulfillment: (body.fulfillment as "DIGITAL" | "PHYSICAL" | "SERVICE") ?? "DIGITAL",
        inventory: body.inventory != null ? Number(body.inventory) : null,
        featuredImageId: body.featuredImageId != null ? String(body.featuredImageId) : null,
        stripePriceId: body.stripePriceId != null ? String(body.stripePriceId) : null,
        stripeProductId: body.stripeProductId != null ? String(body.stripeProductId) : null,
        seoTitle: body.seoTitle != null ? String(body.seoTitle) : null,
        seoDescription: body.seoDescription != null ? String(body.seoDescription) : null,
      },
    });
    res.status(201).json(product);
  });

  r.patch("/:id", requireUser, requirePermission("content:write"), async (req, res) => {
    const body = req.body as Record<string, unknown>;
    try {
      const product = await prisma.product.update({
        where: { id: String(req.params.id) },
        data: {
          ...(body.slug !== undefined && { slug: String(body.slug) }),
          ...(body.name !== undefined && { name: String(body.name) }),
          ...(body.description !== undefined && { description: String(body.description) }),
          ...(body.priceCents !== undefined && { priceCents: Number(body.priceCents) }),
          ...(body.status !== undefined && { status: body.status as ContentStatus }),
          ...(body.featuredImageId !== undefined && {
            featuredImageId: body.featuredImageId != null ? String(body.featuredImageId) : null,
          }),
          ...(body.stripePriceId !== undefined && {
            stripePriceId: body.stripePriceId != null ? String(body.stripePriceId) : null,
          }),
        },
      });
      res.json(product);
    } catch {
      res.status(404).json({ error: "Not found" });
    }
  });

  return r;
}

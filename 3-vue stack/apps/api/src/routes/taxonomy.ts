import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requirePermission, requireUser } from "../middleware/auth.js";

export function taxonomyRouter() {
  const r = Router();

  r.get("/categories", async (_req, res) => {
    const items = await prisma.category.findMany({ orderBy: { name: "asc" } });
    res.json({ items });
  });

  r.get("/categories/:slug", async (req, res) => {
    const cat = await prisma.category.findUnique({ where: { slug: req.params.slug } });
    if (!cat) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(cat);
  });

  r.get("/tags", async (_req, res) => {
    const items = await prisma.tag.findMany({ orderBy: { name: "asc" } });
    res.json({ items });
  });

  r.post("/categories", requireUser, requirePermission("content:write"), async (req, res) => {
    const body = req.body as { slug: string; name: string; description?: string };
    const c = await prisma.category.create({
      data: {
        slug: body.slug,
        name: body.name,
        description: body.description ?? null,
      },
    });
    res.status(201).json(c);
  });

  r.post("/tags", requireUser, requirePermission("content:write"), async (req, res) => {
    const body = req.body as { slug: string; name: string };
    const t = await prisma.tag.create({ data: { slug: body.slug, name: body.name } });
    res.status(201).json(t);
  });

  return r;
}

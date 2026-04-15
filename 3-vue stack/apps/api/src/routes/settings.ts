import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requirePermission, requireUser } from "../middleware/auth.js";

export function settingsRouter() {
  const r = Router();

  r.get("/public", async (_req, res) => {
    const keys = ["site.name", "site.tagline", "social.twitter", "social.linkedin", "analytics.posthog_key"];
    const rows = await prisma.siteSetting.findMany({
      where: { key: { in: keys } },
    });
    const map: Record<string, unknown> = {};
    for (const row of rows) map[row.key] = row.value;
    res.json(map);
  });

  r.get("/admin", requireUser, requirePermission("settings:write"), async (_req, res) => {
    const rows = await prisma.siteSetting.findMany();
    res.json({ items: rows });
  });

  r.put("/:key", requireUser, requirePermission("settings:write"), async (req, res) => {
    const key = String(req.params.key);
    const body = req.body as { value: unknown };
    const row = await prisma.siteSetting.upsert({
      where: { key },
      create: { key, value: body.value as object },
      update: { value: body.value as object },
    });
    res.json(row);
  });

  r.get("/navigation/:slug", async (req, res) => {
    const menu = await prisma.navigationMenu.findUnique({ where: { slug: String(req.params.slug) } });
    if (!menu) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(menu);
  });

  r.put(
    "/navigation/:slug",
    requireUser,
    requirePermission("settings:write"),
    async (req, res) => {
      const body = req.body as { label: string; items: unknown };
      const slug = String(req.params.slug);
      const menu = await prisma.navigationMenu.upsert({
        where: { slug },
        create: {
          slug,
          label: body.label,
          items: body.items as object,
        },
        update: { label: body.label, items: body.items as object },
      });
      res.json(menu);
    },
  );

  return r;
}

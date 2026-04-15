import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireUser } from "../middleware/auth.js";

export function favoritesRouter() {
  const r = Router();

  r.get("/", requireUser, async (req, res) => {
    const userId = req.session.userId!;
    const favs = await prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    res.json({ items: favs });
  });

  r.post("/", requireUser, async (req, res) => {
    const userId = req.session.userId!;
    const body = req.body as { entityType: string; entityId: string };
    const fav = await prisma.favorite.create({
      data: {
        userId,
        entityType: body.entityType,
        entityId: body.entityId,
      },
    });
    res.status(201).json(fav);
  });

  r.delete("/:id", requireUser, async (req, res) => {
    const userId = req.session.userId!;
    const result = await prisma.favorite.deleteMany({
      where: { id: String(req.params.id), userId },
    });
    if (result.count === 0) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.status(204).send();
  });

  return r;
}

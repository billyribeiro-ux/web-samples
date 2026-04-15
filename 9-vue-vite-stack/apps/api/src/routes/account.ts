import { Router } from "express";
import { paramStr } from "../lib/params.js";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { HttpError } from "../lib/errors.js";

export const accountRouter = Router();

accountRouter.get("/orders", requireAuth, async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.sessionRecord!.user.id },
      orderBy: { createdAt: "desc" },
      include: { items: { include: { product: true } } },
    });
    res.json(orders);
  } catch (e) {
    next(e);
  }
});

accountRouter.get("/subscription", requireAuth, async (req, res, next) => {
  try {
    const sub = await prisma.subscription.findFirst({
      where: { userId: req.sessionRecord!.user.id },
      orderBy: { createdAt: "desc" },
      include: { plan: true },
    });
    res.json(sub);
  } catch (e) {
    next(e);
  }
});

accountRouter.get("/favorites", requireAuth, async (req, res, next) => {
  try {
    const favs = await prisma.favorite.findMany({
      where: { userId: req.sessionRecord!.user.id },
      include: { post: { include: { featuredImage: true } } },
    });
    res.json(favs.map((f: { post: unknown }) => f.post));
  } catch (e) {
    next(e);
  }
});

accountRouter.post("/favorites/:postId", requireAuth, async (req, res, next) => {
  try {
    const postId = paramStr(req.params.postId);
    const post = await prisma.post.findFirst({
      where: { id: postId, status: "PUBLISHED" },
    });
    if (!post) return next(new HttpError(404, "Post not found"));
    await prisma.favorite.upsert({
      where: {
        userId_postId: {
          userId: req.sessionRecord!.user.id,
          postId: post.id,
        },
      },
      create: { userId: req.sessionRecord!.user.id, postId: post.id },
      update: {},
    });
    res.status(201).json({ ok: true });
  } catch (e) {
    next(e);
  }
});

accountRouter.delete("/favorites/:postId", requireAuth, async (req, res, next) => {
  try {
    const postId = paramStr(req.params.postId);
    await prisma.favorite.deleteMany({
      where: { userId: req.sessionRecord!.user.id, postId },
    });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

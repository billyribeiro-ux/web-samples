import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { HttpError } from "../lib/errors.js";

export const membersRouter = Router();

membersRouter.get("/library", requireAuth, async (req, res, next) => {
  try {
    const userId = req.sessionRecord!.user.id;
    const activeSub = await prisma.subscription.findFirst({
      where: { userId, status: { in: ["ACTIVE", "TRIALING"] } },
    });
    if (!activeSub) {
      return next(new HttpError(403, "Active membership required"));
    }

    const gatedPosts = await prisma.post.findMany({
      where: {
        status: "PUBLISHED",
        gatedRules: { some: {} },
      },
      orderBy: { publishedAt: "desc" },
      include: { featuredImage: true, author: true },
    });

    res.json({ posts: gatedPosts });
  } catch (e) {
    next(e);
  }
});

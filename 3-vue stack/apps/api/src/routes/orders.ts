import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireUser } from "../middleware/auth.js";

export function ordersRouter() {
  const r = Router();

  r.get("/mine", requireUser, async (req, res) => {
    const userId = req.session.userId!;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const orders = await prisma.order.findMany({
      where: { email: user.email },
      orderBy: { createdAt: "desc" },
      include: { items: { include: { product: true } } },
    });
    res.json({ orders });
  });

  return r;
}

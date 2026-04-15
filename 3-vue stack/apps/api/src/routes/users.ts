import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireUser } from "../middleware/auth.js";

export function usersRouter() {
  const r = Router();

  r.patch("/notifications", requireUser, async (req, res) => {
    const userId = req.session.userId!;
    const body = req.body as { marketing?: boolean; product?: boolean };
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(body.marketing !== undefined && { notificationMarketing: body.marketing }),
        ...(body.product !== undefined && { notificationProduct: body.product }),
      },
    });
    res.json({
      notificationMarketing: user.notificationMarketing,
      notificationProduct: user.notificationProduct,
    });
  });

  return r;
}

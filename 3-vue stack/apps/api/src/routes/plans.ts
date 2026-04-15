import { Router } from "express";
import { prisma } from "../lib/prisma.js";

export function plansRouter() {
  const r = Router();

  r.get("/", async (_req, res) => {
    const plans = await prisma.plan.findMany({ orderBy: { amountCents: "asc" } });
    res.json({ plans });
  });

  return r;
}

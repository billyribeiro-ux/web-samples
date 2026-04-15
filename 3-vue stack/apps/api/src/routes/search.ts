import { Router } from "express";
import { searchPostgres } from "../lib/search.js";
import { prisma } from "../lib/prisma.js";

export function searchRouter() {
  const r = Router();

  r.get("/", async (req, res) => {
    const q = typeof req.query.q === "string" ? req.query.q : "";
    const hits = await searchPostgres(prisma, q);
    res.json({ hits });
  });

  return r;
}

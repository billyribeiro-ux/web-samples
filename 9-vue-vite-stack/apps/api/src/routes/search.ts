import { Router } from "express";
import { searchAll } from "../services/search.js";

export const searchRouter = Router();

searchRouter.get("/", async (req, res, next) => {
  try {
    const q = typeof req.query.q === "string" ? req.query.q : "";
    const limit = Math.min(Number(req.query.limit ?? 20) || 20, 50);
    const hits = await searchAll(q, limit);
    res.json({ hits });
  } catch (e) {
    next(e);
  }
});

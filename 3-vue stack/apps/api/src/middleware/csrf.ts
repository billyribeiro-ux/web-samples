import type { NextFunction, Request, Response } from "express";
import { randomToken } from "../lib/tokens.js";

const SAFE = new Set(["GET", "HEAD", "OPTIONS"]);

export function ensureCsrfSession(req: Request, _res: Response, next: NextFunction) {
  if (!req.session.csrfToken) {
    req.session.csrfToken = randomToken(24);
  }
  next();
}

export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  if (SAFE.has(req.method)) return next();
  const header = req.get("x-csrf-token");
  const sessionToken = req.session.csrfToken;
  if (!sessionToken || header !== sessionToken) {
    res.status(403).json({ error: "Invalid CSRF token" });
    return;
  }
  next();
}

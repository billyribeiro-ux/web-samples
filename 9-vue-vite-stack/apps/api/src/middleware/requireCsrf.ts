import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../lib/errors.js";
import { readCsrfHeader, verifyCsrfToken } from "../lib/csrf.js";

const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function requireCsrf(req: Request, _res: Response, next: NextFunction) {
  if (!MUTATING.has(req.method)) return next();
  const session = req.sessionRecord;
  if (!session?.csrfSecret) return next();
  const token = readCsrfHeader(req);
  if (!verifyCsrfToken(session.csrfSecret, token)) {
    return next(new HttpError(403, "Invalid CSRF token"));
  }
  next();
}

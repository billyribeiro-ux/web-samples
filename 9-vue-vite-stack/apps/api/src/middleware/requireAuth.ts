import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../lib/errors.js";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  if (!req.sessionRecord?.user) {
    return next(new HttpError(401, "Unauthorized"));
  }
  next();
}

import Tokens from "csrf";
import type { Request } from "express";

const tokens = new Tokens();

export function newCsrfSecret(): string {
  return tokens.secretSync();
}

export function createCsrfToken(secret: string): string {
  return tokens.create(secret);
}

export function verifyCsrfToken(secret: string, token: string | undefined): boolean {
  if (!token) return false;
  return tokens.verify(secret, token);
}

export function readCsrfHeader(req: Request): string | undefined {
  const h = req.headers["x-csrf-token"];
  if (typeof h === "string") return h;
  if (Array.isArray(h)) return h[0];
  return undefined;
}

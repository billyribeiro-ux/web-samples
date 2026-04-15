import { Router } from "express";
import rateLimit from "express-rate-limit";
import { contactFormSchema, newsletterSchema } from "@platform/shared";
import { prisma } from "../lib/prisma.js";
import type { Env } from "../config.js";

const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

export function formsRouter(_env: Env) {
  const r = Router();

  r.post("/contact", formLimiter, async (req, res) => {
    const parsed = contactFormSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    if (parsed.data.website) {
      res.status(400).json({ error: "Spam detected" });
      return;
    }
    await prisma.formSubmission.create({
      data: {
        type: "contact",
        payload: {
          name: parsed.data.name,
          email: parsed.data.email,
          subject: parsed.data.subject,
          message: parsed.data.message,
        },
        ip: req.ip,
        userAgent: req.get("user-agent") ?? undefined,
      },
    });
    res.status(201).json({ ok: true });
  });

  r.post("/newsletter", formLimiter, async (req, res) => {
    const parsed = newsletterSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    if (parsed.data.website) {
      res.status(400).json({ error: "Spam detected" });
      return;
    }
    await prisma.newsletterLead.create({
      data: {
        email: parsed.data.email.toLowerCase(),
        source: "footer",
      },
    });
    res.status(201).json({ ok: true });
  });

  return r;
}

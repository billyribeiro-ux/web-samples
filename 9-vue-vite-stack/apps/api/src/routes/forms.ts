import { Router } from "express";
import { contactFormSchema, newsletterFormSchema } from "shared";
import { HttpError } from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";

export const formsRouter = Router();

formsRouter.post("/contact", async (req, res, next) => {
  try {
    const parsed = contactFormSchema.safeParse(req.body);
    if (!parsed.success) return next(new HttpError(400, "Invalid input"));
    if (parsed.data.website) {
      return res.json({ ok: true });
    }
    await prisma.formSubmission.create({
      data: {
        type: "contact",
        data: parsed.data,
      },
    });
    res.status(201).json({ ok: true });
  } catch (e) {
    next(e);
  }
});

formsRouter.post("/newsletter", async (req, res, next) => {
  try {
    const parsed = newsletterFormSchema.safeParse(req.body);
    if (!parsed.success) return next(new HttpError(400, "Invalid input"));
    if (parsed.data.website) {
      return res.json({ ok: true });
    }
    await prisma.newsletterLead.create({
      data: { email: parsed.data.email.toLowerCase(), source: parsed.data.source ?? "site" },
    });
    res.status(201).json({ ok: true });
  } catch (e) {
    next(e);
  }
});

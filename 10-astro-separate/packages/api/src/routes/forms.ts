import { Hono } from "hono";
import { z } from "zod";
import { FormSubmissionType } from "@repo/db";
import { prisma } from "@repo/db";
import { rateLimitHit } from "../lib/rate-limit.js";
import { ApiError } from "../lib/errors.js";

export const formsRoutes = new Hono()
  .post("/contact", async (c) => {
    const ip = c.req.header("x-forwarded-for") ?? "unknown";
    const rl = await rateLimitHit(prisma, `form:contact:${ip}`, { max: 20 });
    if (!rl.ok) throw new ApiError(429, "Too many requests", "RATE_LIMIT");

    const body = z
      .object({
        name: z.string().min(1).max(120),
        email: z.string().email(),
        message: z.string().min(1).max(8000),
        company: z.string().max(200).optional(),
      })
      .parse(await c.req.json());

    await prisma.formSubmission.create({
      data: {
        type: FormSubmissionType.CONTACT,
        payload: body,
        ip,
        userAgent: c.req.header("user-agent") ?? null,
      },
    });
    return c.json({ ok: true });
  })
  .post("/newsletter", async (c) => {
    const ip = c.req.header("x-forwarded-for") ?? "unknown";
    const rl = await rateLimitHit(prisma, `form:newsletter:${ip}`, { max: 30 });
    if (!rl.ok) throw new ApiError(429, "Too many requests", "RATE_LIMIT");

    const body = z
      .object({
        email: z.string().email(),
        source: z.string().max(120).optional(),
      })
      .parse(await c.req.json());

    await prisma.newsletterLead.upsert({
      where: { email: body.email.toLowerCase() },
      update: { source: body.source },
      create: { email: body.email.toLowerCase(), source: body.source },
    });

    await prisma.formSubmission.create({
      data: {
        type: FormSubmissionType.NEWSLETTER,
        payload: body,
        ip,
        userAgent: c.req.header("user-agent") ?? null,
      },
    });
    return c.json({ ok: true });
  })
  .post("/lead", async (c) => {
    const ip = c.req.header("x-forwarded-for") ?? "unknown";
    const rl = await rateLimitHit(prisma, `form:lead:${ip}`, { max: 20 });
    if (!rl.ok) throw new ApiError(429, "Too many requests", "RATE_LIMIT");

    const body = z
      .object({
        email: z.string().email(),
        interest: z.string().max(200).optional(),
        notes: z.string().max(4000).optional(),
      })
      .parse(await c.req.json());

    await prisma.formSubmission.create({
      data: {
        type: FormSubmissionType.LEAD,
        payload: body,
        ip,
        userAgent: c.req.header("user-agent") ?? null,
      },
    });
    return c.json({ ok: true });
  });

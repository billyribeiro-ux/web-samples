import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { contactFormSchema, leadFormSchema, newsletterFormSchema } from '@acme/shared';
import { FormType } from '@prisma/client';
import type { Env } from '../lib/env.js';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../middleware/errors.js';
import { Resend } from 'resend';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
});

export function createFormsRouter(env: Env) {
  const router = Router();
  router.use(limiter);

  router.post(
    '/contact',
    asyncHandler(async (req, res) => {
      const body = contactFormSchema.parse(req.body);
      await prisma.formSubmission.create({
        data: {
          type: FormType.CONTACT,
          payload: body,
          ip: req.ip,
          userAgent: req.get('user-agent') ?? undefined,
        },
      });
      if (env.RESEND_API_KEY && env.RESEND_FROM_EMAIL) {
        const resend = new Resend(env.RESEND_API_KEY);
        await resend.emails.send({
          from: env.RESEND_FROM_EMAIL,
          to: env.RESEND_FROM_EMAIL,
          subject: `[Contact] ${body.subject}`,
          html: `<p>From: ${body.name} &lt;${body.email}&gt;</p><p>${body.message.replace(/\n/g, '<br/>')}</p>`,
        });
      }
      res.status(201).json({ ok: true });
    })
  );

  router.post(
    '/newsletter',
    asyncHandler(async (req, res) => {
      const body = newsletterFormSchema.parse(req.body);
      await prisma.formSubmission.create({
        data: {
          type: FormType.NEWSLETTER,
          payload: body,
          ip: req.ip,
          userAgent: req.get('user-agent') ?? undefined,
        },
      });
      res.status(201).json({ ok: true });
    })
  );

  router.post(
    '/lead',
    asyncHandler(async (req, res) => {
      const body = leadFormSchema.parse(req.body);
      await prisma.formSubmission.create({
        data: {
          type: FormType.LEAD,
          payload: body,
          ip: req.ip,
          userAgent: req.get('user-agent') ?? undefined,
        },
      });
      res.status(201).json({ ok: true });
    })
  );

  return router;
}

import type { WebhookEvent } from '@clerk/backend';
import type { Request, Response } from 'express';
import { Webhook } from 'svix';
import type { Env } from '../../lib/env.js';
import { prisma } from '../../lib/prisma.js';
import { asyncHandler, HttpError } from '../../middleware/errors.js';

export function createClerkWebhookHandler(env: Env) {
  return asyncHandler(async (req: Request, res: Response) => {
    const secret = env.CLERK_WEBHOOK_SECRET;
    if (!secret) {
      throw new HttpError(503, 'Clerk webhooks not configured');
    }

    const svixId = req.headers['svix-id'] as string | undefined;
    const svixTimestamp = req.headers['svix-timestamp'] as string | undefined;
    const svixSignature = req.headers['svix-signature'] as string | undefined;
    if (!svixId || !svixTimestamp || !svixSignature) {
      throw new HttpError(400, 'Missing svix headers');
    }

    const payload = req.body instanceof Buffer ? req.body.toString('utf8') : String(req.body);
    const wh = new Webhook(secret);
    let evt: WebhookEvent;
    try {
      evt = wh.verify(payload, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      }) as WebhookEvent;
    } catch {
      throw new HttpError(400, 'Invalid webhook signature');
    }

    if (evt.type === 'user.created' || evt.type === 'user.updated') {
      const u = evt.data;
      const email =
        u.email_addresses?.find((e) => e.id === u.primary_email_address_id)?.email_address ??
        u.email_addresses?.[0]?.email_address ??
        `user+${u.id}@placeholder.local`;

      await prisma.user.upsert({
        where: { clerkId: u.id },
        create: {
          clerkId: u.id,
          email,
          firstName: u.first_name ?? undefined,
          lastName: u.last_name ?? undefined,
          imageUrl: u.image_url ?? undefined,
        },
        update: {
          email,
          firstName: u.first_name ?? undefined,
          lastName: u.last_name ?? undefined,
          imageUrl: u.image_url ?? undefined,
        },
      });
    }

    if (evt.type === 'user.deleted') {
      const id = evt.data.id;
      if (id) {
        await prisma.user.deleteMany({ where: { clerkId: id } });
      }
    }

    res.json({ ok: true });
  });
}

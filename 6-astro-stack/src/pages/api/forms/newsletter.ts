import type { APIRoute } from 'astro';

import { prisma } from '@/lib/prisma';
import { newsletterSchema } from '@/schemas/forms';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json().catch(() => null);
  const parsed = newsletterSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: 'Invalid email' }), { status: 400 });
  }

  await prisma.newsletterLead.upsert({
    where: { email: parsed.data.email },
    create: { email: parsed.data.email, source: parsed.data.source ?? 'footer' },
    update: {},
  });

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
};

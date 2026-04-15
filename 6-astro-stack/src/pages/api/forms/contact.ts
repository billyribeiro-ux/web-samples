import type { APIRoute } from 'astro';

import { prisma } from '@/lib/prisma';
import { contactSchema } from '@/schemas/forms';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: 'Invalid input', issues: parsed.error.flatten() }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  if (parsed.data._hp) {
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const recent = await prisma.formSubmission.count({
    where: {
      formType: 'contact',
      ip,
      createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
    },
  });
  if (recent > 20) {
    return new Response(JSON.stringify({ error: 'Rate limited' }), { status: 429 });
  }

  await prisma.formSubmission.create({
    data: {
      formType: 'contact',
      payload: {
        name: parsed.data.name,
        email: parsed.data.email,
        message: parsed.data.message,
      },
      ip,
      userAgent: request.headers.get('user-agent') ?? undefined,
    },
  });

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

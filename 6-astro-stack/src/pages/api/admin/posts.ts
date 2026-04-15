import type { APIRoute } from 'astro';

import { requireAdmin } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const gate = await requireAdmin(request);
  if (!gate.ok) return gate.response;

  const form = await request.formData();
  const title = String(form.get('title') ?? '');
  const slug = String(form.get('slug') ?? '').toLowerCase().replace(/\s+/g, '-');
  const excerpt = String(form.get('excerpt') ?? '') || null;
  const body = String(form.get('body') ?? '');

  if (!title || !slug || !body) {
    return new Response('Missing fields', { status: 400 });
  }

  await prisma.post.create({
    data: {
      title,
      slug,
      excerpt,
      body,
      status: 'DRAFT',
      readingMinutes: Math.max(1, Math.ceil(body.split(/\s+/).length / 200)),
    },
  });

  return Response.redirect(new URL('/admin/posts', request.url), 303);
};

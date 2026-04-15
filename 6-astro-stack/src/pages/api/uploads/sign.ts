import type { APIRoute } from 'astro';
import { z } from 'zod';

import { requireAdmin } from '@/lib/api-auth';
import { presignPut, publicObjectUrl } from '@/lib/s3';

export const prerender = false;

const schema = z.object({
  filename: z.string().min(1).max(200),
  contentType: z.string().min(1).max(120),
});

export const POST: APIRoute = async ({ request }) => {
  const gate = await requireAdmin(request);
  if (!gate.ok) return gate.response;

  const json = await request.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: 'Invalid body' }), { status: 400 });
  }

  const key = `uploads/${crypto.randomUUID()}-${parsed.data.filename.replace(/[^a-zA-Z0-9._-]/g, '')}`;
  const url = await presignPut(key, parsed.data.contentType);
  if (!url) {
    return new Response(JSON.stringify({ error: 'S3 not configured' }), { status: 501 });
  }

  return new Response(
    JSON.stringify({
      uploadUrl: url,
      publicUrl: publicObjectUrl(key),
      key,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
};

import { error, json } from '@sveltejs/kit';
import { z } from 'zod';
import { requireAdmin } from '$lib/server/rbac/guards';
import { createPresignedUpload } from '$lib/server/storage/s3';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

const bodySchema = z.object({
	mimeType: z.string().min(3).max(128),
	sizeBytes: z.number().int().min(1).max(10_000_000)
});

export const POST: RequestHandler = async (event) => {
	requireAdmin(event);
	if (!env.S3_BUCKET) throw error(503, 'Object storage not configured');

	let parsed;
	try {
		parsed = bodySchema.parse(await event.request.json());
	} catch {
		throw error(400, 'Invalid body');
	}

	const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
	if (!allowed.includes(parsed.mimeType)) throw error(400, 'Unsupported type');

	const { uploadUrl, key, publicUrl } = await createPresignedUpload({
		keyPrefix: 'uploads',
		mimeType: parsed.mimeType,
		maxBytes: parsed.sizeBytes
	});

	return json({ uploadUrl, key, publicUrl });
};

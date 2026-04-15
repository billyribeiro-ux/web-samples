import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '$env/dynamic/private';
import { nanoid } from 'nanoid';

function client() {
	const region = env.S3_REGION ?? 'us-east-1';
	return new S3Client({
		region,
		credentials:
			env.S3_ACCESS_KEY_ID && env.S3_SECRET_ACCESS_KEY
				? {
						accessKeyId: env.S3_ACCESS_KEY_ID,
						secretAccessKey: env.S3_SECRET_ACCESS_KEY
					}
				: undefined
	});
}

export async function createPresignedUpload(opts: {
	keyPrefix: string;
	mimeType: string;
	maxBytes: number;
}): Promise<{ uploadUrl: string; key: string; publicUrl: string }> {
	const bucket = env.S3_BUCKET;
	if (!bucket) throw new Error('S3_BUCKET is not set');

	const key = `${opts.keyPrefix}/${nanoid()}`;
	const command = new PutObjectCommand({
		Bucket: bucket,
		Key: key,
		ContentType: opts.mimeType
	});
	if (opts.maxBytes > 10 * 1024 * 1024) throw new Error('File too large');

	const uploadUrl = await getSignedUrl(client(), command, { expiresIn: 60 * 5 });
	const base = env.S3_PUBLIC_BASE_URL?.replace(/\/$/, '') ?? '';
	const publicUrl = base ? `${base}/${key}` : `s3://${bucket}/${key}`;

	return { uploadUrl, key, publicUrl };
}

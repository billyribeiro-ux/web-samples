import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { Env } from './env.js';

export function createS3(env: Env) {
  if (
    !env.S3_BUCKET ||
    !env.S3_REGION ||
    !env.S3_ACCESS_KEY_ID ||
    !env.S3_SECRET_ACCESS_KEY
  ) {
    return null;
  }
  return new S3Client({
    region: env.S3_REGION,
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY_ID,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    },
  });
}

export async function presignPut(
  client: S3Client,
  bucket: string,
  key: string,
  contentType: string,
  publicBaseUrl?: string
): Promise<{ uploadUrl: string; publicUrl: string; key: string }> {
  const cmd = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });
  const uploadUrl = await getSignedUrl(client, cmd, { expiresIn: 3600 });
  const publicUrl = publicBaseUrl ? `${publicBaseUrl.replace(/\/$/, '')}/${key}` : uploadUrl;
  return { uploadUrl, publicUrl, key };
}

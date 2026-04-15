import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

function client() {
  const endpoint = process.env.S3_ENDPOINT;
  const region = process.env.S3_REGION ?? 'us-east-1';
  const accessKeyId = process.env.S3_ACCESS_KEY;
  const secretAccessKey = process.env.S3_SECRET_KEY;
  if (!endpoint || !accessKeyId || !secretAccessKey) return null;
  return new S3Client({
    region,
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true,
  });
}

export async function presignPut(key: string, contentType: string, expiresIn = 3600) {
  const c = client();
  const bucket = process.env.S3_BUCKET;
  if (!c || !bucket) return null;
  const cmd = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType });
  return getSignedUrl(c, cmd, { expiresIn });
}

export function publicObjectUrl(key: string): string {
  const base = process.env.S3_PUBLIC_URL?.replace(/\/$/, '');
  if (!base) return '';
  return `${base}/${key}`;
}

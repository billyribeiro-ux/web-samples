import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export function getS3Client() {
  const config = useRuntimeConfig()
  if (!config.s3Region || !config.s3AccessKey || !config.s3SecretKey) {
    return null
  }
  return new S3Client({
    region: config.s3Region,
    credentials: {
      accessKeyId: config.s3AccessKey,
      secretAccessKey: config.s3SecretKey,
    },
  })
}

export async function presignUpload(key: string, contentType: string, expiresIn = 3600) {
  const config = useRuntimeConfig()
  const client = getS3Client()
  if (!client || !config.s3Bucket) {
    throw createError({ statusCode: 503, statusMessage: 'Object storage not configured' })
  }
  const cmd = new PutObjectCommand({
    Bucket: config.s3Bucket,
    Key: key,
    ContentType: contentType,
  })
  const url = await getSignedUrl(client, cmd, { expiresIn })
  const publicUrl = config.s3PublicBaseUrl
    ? `${config.s3PublicBaseUrl.replace(/\/$/, '')}/${key}`
    : `https://${config.s3Bucket}.s3.${config.s3Region}.amazonaws.com/${key}`
  return { uploadUrl: url, publicUrl }
}

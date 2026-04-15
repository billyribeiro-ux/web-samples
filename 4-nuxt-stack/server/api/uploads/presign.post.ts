import { z } from 'zod'
import { randomBytes } from 'node:crypto'
import prisma from '../../utils/prisma'
import { requireAdmin } from '../../utils/auth'
import { presignUpload } from '../../utils/s3'

const schema = z.object({
  filename: z.string().min(1),
  contentType: z.string().min(1),
  sizeBytes: z.number().max(10 * 1024 * 1024),
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = schema.parse(await readBody(event))
  const key = `uploads/${Date.now()}-${randomBytes(8).toString('hex')}-${body.filename.replace(/[^a-zA-Z0-9._-]/g, '')}`
  const { uploadUrl, publicUrl } = await presignUpload(key, body.contentType)
  await prisma.mediaAsset.create({
    data: {
      key,
      url: publicUrl,
      mimeType: body.contentType,
      sizeBytes: body.sizeBytes,
    },
  })
  return { uploadUrl, publicUrl, key }
})

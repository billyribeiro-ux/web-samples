import prisma from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  const key = getRouterParam(event, 'key')
  if (!key) throw createError({ statusCode: 400 })
  const row = await prisma.siteSetting.findUnique({ where: { key } })
  if (!row) return { value: {} }
  return { value: row.value as Record<string, string> }
})

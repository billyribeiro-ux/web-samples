import prisma from '../utils/prisma'
import { FALLBACK_PLANS } from '../utils/plans-fallback'

export default defineEventHandler(async () => {
  try {
    const items = await prisma.plan.findMany({ orderBy: { priceMonthlyCents: 'asc' } })
    if (items.length > 0) {
      return { items, source: 'database' as const }
    }
  } catch (err) {
    console.error('[api/plans]', err)
  }
  return {
    items: FALLBACK_PLANS.map((p) => ({ ...p })),
    source: 'fallback' as const,
  }
})

import { searchSite } from '../utils/search'

export default defineEventHandler(async (event) => {
  const q = getQuery(event).q
  const query = typeof q === 'string' ? q : ''
  const hits = await searchSite(query, 30)
  return { hits }
})

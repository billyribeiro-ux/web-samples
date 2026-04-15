import { appendHeader } from 'h3'
import { lucia } from '../../utils/lucia'
import { getSessionUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const { session } = await getSessionUser(event)
  if (!session) {
    return { ok: true }
  }
  await lucia.invalidateSession(session.id)
  appendHeader(event, 'Set-Cookie', lucia.createBlankSessionCookie().serialize())
  return { ok: true }
})

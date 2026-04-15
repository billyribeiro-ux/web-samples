import { createHash, randomBytes } from 'node:crypto'
import type { H3Event } from 'h3'
import { getHeader, appendHeader } from 'h3'
import prisma from './prisma'
import { lucia } from './lucia'

export async function getSessionUser(event: H3Event) {
  const sessionId = lucia.readSessionCookie(getHeader(event, 'cookie') ?? '')
  if (!sessionId) {
    return { user: null, session: null }
  }
  const result = await lucia.validateSession(sessionId)
  if (result.session?.fresh) {
    appendHeader(event, 'Set-Cookie', lucia.createSessionCookie(result.session.id).serialize())
  }
  if (!result.session) {
    appendHeader(event, 'Set-Cookie', lucia.createBlankSessionCookie().serialize())
  }
  return result
}

export async function requireUser(event: H3Event) {
  const { user, session } = await getSessionUser(event)
  if (!user || !session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  return { user, session }
}

export async function getUserRoles(userId: string) {
  const rows = await prisma.userRole.findMany({
    where: { userId },
    include: { role: { include: { permissions: { include: { permission: true } } } } },
  })
  return rows.map((r) => r.role)
}

export async function userHasPermission(userId: string, slug: string) {
  const roles = await getUserRoles(userId)
  return roles.some((role) =>
    role.permissions.some((rp) => rp.permission.slug === slug),
  )
}

export async function userHasRoleSlug(userId: string, slug: string) {
  const roles = await getUserRoles(userId)
  return roles.some((r) => r.slug === slug)
}

export async function requireAdmin(event: H3Event) {
  const { user } = await requireUser(event)
  const ok =
    (await userHasPermission(user.id, 'admin.access')) ||
    (await userHasPermission(user.id, 'content.publish')) ||
    (await userHasRoleSlug(user.id, 'super_admin')) ||
    (await userHasRoleSlug(user.id, 'admin')) ||
    (await userHasRoleSlug(user.id, 'editor'))
  if (!ok) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }
  return user
}

export function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export function generateToken() {
  return randomBytes(32).toString('hex')
}

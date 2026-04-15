type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const b = buckets.get(key)
  if (!b || now > b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  if (b.count >= limit) return false
  b.count += 1
  return true
}

export function getClientIp(event: { node?: { req?: { headers?: Record<string, string | string[] | undefined> } } }): string {
  const xf = event.node?.req?.headers?.['x-forwarded-for']
  const raw = Array.isArray(xf) ? xf[0] : xf
  return raw?.split(',')[0]?.trim() || 'local'
}

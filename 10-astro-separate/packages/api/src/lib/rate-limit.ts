import type { PrismaClient } from "@repo/db";

const WINDOW_MS = 60_000;
const MAX_HITS = 30;

export async function rateLimitHit(
  prisma: PrismaClient,
  key: string,
  opts?: { windowMs?: number; max?: number }
): Promise<{ ok: boolean; remaining: number }> {
  const windowMs = opts?.windowMs ?? WINDOW_MS;
  const max = opts?.max ?? MAX_HITS;
  const now = Date.now();
  const windowKey = String(Math.floor(now / windowMs));
  const expiresAt = new Date(now + windowMs * 2);

  const row = await prisma.rateLimitBucket.upsert({
    where: { key_windowKey: { key, windowKey } },
    create: { key, windowKey, count: 1, expiresAt },
    update: { count: { increment: 1 }, expiresAt },
  });

  const remaining = Math.max(0, max - row.count);
  return { ok: row.count <= max, remaining };
}

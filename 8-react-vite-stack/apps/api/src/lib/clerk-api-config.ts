/**
 * When false, skip real Clerk middleware and attach a signed-out auth stub so
 * public routes (and Prisma) work for local dev without valid Clerk keys.
 */
export function isClerkApiConfigured(): boolean {
  const pub = process.env.CLERK_PUBLISHABLE_KEY?.trim() ?? '';
  const sec = process.env.CLERK_SECRET_KEY?.trim() ?? '';
  if (!pub || !sec) return false;
  if (pub.includes('replace_me') || sec.includes('replace_me')) return false;
  const pubOk = pub.startsWith('pk_test_') || pub.startsWith('pk_live_');
  const secOk = sec.startsWith('sk_test_') || sec.startsWith('sk_live_');
  return pubOk && secOk;
}

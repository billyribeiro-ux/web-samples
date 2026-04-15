/**
 * Clerk publishable keys must come from the dashboard. Placeholder / empty values
 * enable local UI development without Clerk (see DevAuthRoot in main.tsx).
 */
export function isClerkConfigured(): boolean {
  const k = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.trim() ?? '';
  if (!k) return false;
  if (k.includes('replace_me')) return false;
  return k.startsWith('pk_test_') || k.startsWith('pk_live_');
}

export function clerkPublishableKey(): string | undefined {
  const k = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.trim();
  return k || undefined;
}

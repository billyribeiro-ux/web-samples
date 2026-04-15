import { isClerkConfigured } from '@/lib/clerk-config.js';

export function DevModeBanner() {
  if (isClerkConfigured()) return null;
  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-950">
      <strong>Dev mode:</strong> Clerk is not configured (missing or placeholder{' '}
      <code className="rounded bg-amber-100 px-1">VITE_CLERK_PUBLISHABLE_KEY</code>). Public pages work; sign-in and
      authenticated API calls are disabled until you add keys from the{' '}
      <a className="font-medium underline" href="https://dashboard.clerk.com/last-active?path=api-keys">
        Clerk dashboard
      </a>
      .
    </div>
  );
}

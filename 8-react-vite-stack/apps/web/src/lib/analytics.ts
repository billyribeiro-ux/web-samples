/**
 * GA4 / PostHog-ready instrumentation. Wire env keys in production.
 */
export function track(event: string, props?: Record<string, unknown>) {
  if (import.meta.env.DEV) {
    console.debug('[analytics]', event, props);
    return;
  }
  const posthogKey = import.meta.env.VITE_POSTHOG_KEY;
  if (posthogKey && typeof window !== 'undefined' && (window as unknown as { posthog?: { capture: (e: string, p?: object) => void } }).posthog) {
    (window as unknown as { posthog: { capture: (e: string, p?: object) => void } }).posthog.capture(event, props);
  }
  const gaId = import.meta.env.VITE_GA4_ID;
  if (gaId && typeof window !== 'undefined' && (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag) {
    (window as unknown as { gtag: (...a: unknown[]) => void }).gtag('event', event, props);
  }
}

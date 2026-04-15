/**
 * PostHog / GA4-ready instrumentation. No-op until keys are provided.
 */
export function trackPageView(path: string) {
  const posthogKey = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
  if (posthogKey && typeof window !== "undefined" && (window as unknown as { posthog?: { capture: (e: string, p?: object) => void } }).posthog) {
    (window as unknown as { posthog: { capture: (e: string, p?: object) => void } }).posthog.capture("$pageview", { path });
  }
  const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;
  if (gaId && typeof window !== "undefined" && (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag) {
    (window as unknown as { gtag: (...a: unknown[]) => void }).gtag("event", "page_view", { page_path: path });
  }
}

export function trackEvent(name: string, props?: Record<string, unknown>) {
  const posthogKey = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
  if (posthogKey && typeof window !== "undefined" && (window as unknown as { posthog?: { capture: (e: string, p?: object) => void } }).posthog) {
    (window as unknown as { posthog: { capture: (e: string, p?: object) => void } }).posthog.capture(name, props);
  }
}

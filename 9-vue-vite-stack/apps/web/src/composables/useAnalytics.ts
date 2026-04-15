/** GA4 / PostHog-ready: push structured events without hard-coding vendors. */
export function useAnalytics() {
  function track(name: string, props?: Record<string, unknown>) {
    const w = window as unknown as { dataLayer?: unknown[]; posthog?: { capture: (e: string, p?: object) => void } };
    w.dataLayer = w.dataLayer ?? [];
    w.dataLayer.push({ event: name, ...props });
    if (w.posthog?.capture) w.posthog.capture(name, props);
  }

  return { track };
}

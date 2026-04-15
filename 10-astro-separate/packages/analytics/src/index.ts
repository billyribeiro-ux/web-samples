export type AnalyticsEvent =
  | { name: "page_view"; path: string }
  | { name: "form_submit"; form: string }
  | { name: "checkout_start"; orderId?: string }
  | { name: "cta_click"; label: string; href: string };

export function trackEvent(event: AnalyticsEvent): void {
  if (typeof window === "undefined") return;
  const w = window as unknown as { posthog?: { capture: (n: string, p?: object) => void }; gtag?: (...a: unknown[]) => void };
  if (w.posthog) {
    w.posthog.capture(event.name, event as unknown as object);
    return;
  }
  if (w.gtag) {
    w.gtag("event", event.name, event as unknown as object);
    return;
  }
  if (typeof console !== "undefined" && console.debug) {
    console.debug("[analytics]", event);
  }
}

export function analyticsSnippet(): string {
  const ph = process.env.PUBLIC_POSTHOG_KEY;
  const ga = process.env.PUBLIC_GA4_MEASUREMENT_ID;
  if (ph) {
    return `<!-- PostHog: load via official snippet when PUBLIC_POSTHOG_KEY is set -->`;
  }
  if (ga) {
    return `<!-- GA4: load gtag.js when ready -->`;
  }
  return "";
}

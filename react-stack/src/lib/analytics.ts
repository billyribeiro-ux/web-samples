import posthog from "posthog-js";

let initialized = false;

export function initPosthog() {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
  if (!key || typeof window === "undefined" || initialized) return;
  initialized = true;
  posthog.init(key, {
    api_host: host ?? "https://us.i.posthog.com",
    capture_pageview: false,
    persistence: "localStorage",
  });
}

export function trackEvent(
  name: string,
  props?: Record<string, string | number | boolean | undefined>,
) {
  if (typeof window === "undefined" || !process.env.NEXT_PUBLIC_POSTHOG_KEY)
    return;
  posthog.capture(name, props);
}

export function capturePageview(path: string) {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  posthog.capture("$pageview", { path });
}

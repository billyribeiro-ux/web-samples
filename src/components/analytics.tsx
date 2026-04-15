"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/** GA4 dataLayer + optional PostHog — wire env vars in production. */
export function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    if (gaId && typeof window !== "undefined") {
      window.dataLayer = window.dataLayer ?? [];
      window.dataLayer.push({
        event: "page_view",
        page_path: pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : ""),
      });
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
    if (!key || typeof window === "undefined") return;
    import("posthog-js")
      .then(({ default: posthog }) => {
        posthog.init(key, {
          api_host: host ?? "https://us.i.posthog.com",
          person_profiles: "identified_only",
        });
        posthog.capture("$pageview");
      })
      .catch(() => {});
  }, [pathname]);

  return null;
}

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

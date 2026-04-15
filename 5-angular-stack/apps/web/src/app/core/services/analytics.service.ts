import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

/** Hooks for PostHog / GA4 — wire script tags in index.html when keys are set. */
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  track(event: string, properties?: Record<string, unknown>) {
    if (!environment.production) {
      console.debug('[analytics]', event, properties);
      return;
    }
    const w = window as unknown as {
      posthog?: { capture: (e: string, p?: object) => void };
      gtag?: (...args: unknown[]) => void;
    };
    w.posthog?.capture(event, properties);
    if (w.gtag && environment.analytics.gaMeasurementId) {
      w.gtag('event', event, properties);
    }
  }
}

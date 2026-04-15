/** Client-safe: call from islands after consent / env gate. */
export function trackEvent(name: string, props?: Record<string, string | number | boolean>) {
  if (typeof window === 'undefined') return;
  const key = import.meta.env.PUBLIC_POSTHOG_KEY;
  if (!key) {
    if (import.meta.env.DEV) console.debug('[analytics]', name, props);
    return;
  }
  void import('posthog-js').then(({ default: posthog }) => {
    posthog.init(key, {
      api_host: import.meta.env.PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com',
      person_profiles: 'identified_only',
    });
    posthog.capture(name, props);
  });
}

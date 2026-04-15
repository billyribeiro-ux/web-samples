import { env as publicEnv } from '$env/dynamic/public';

/** Server-side analytics hook; wire to PostHog/GA4 exporters without coupling routes to vendors. */
export async function trackServerEvent(
	event: string,
	properties?: Record<string, string | number | boolean | null | undefined>
): Promise<void> {
	const payload = { event, properties: properties ?? {}, ts: new Date().toISOString() };
	if (publicEnv.PUBLIC_POSTHOG_KEY) {
		// Future: posthog-node capture
	}
	console.info('[analytics]', JSON.stringify(payload));
}

<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();

	/** GA4 / PostHog-ready: push route changes to dataLayer (must live in a component, not hooks.client). */
	afterNavigate(({ to }) => {
		if (typeof window === 'undefined') return;
		const w = window as Window & { dataLayer?: unknown[] };
		w.dataLayer ??= [];
		w.dataLayer.push({
			event: 'page_view',
			path: to?.url.pathname ?? ''
		});
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}

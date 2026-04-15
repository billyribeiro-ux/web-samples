<script lang="ts">
	import SiteHeader from '$lib/components/site/SiteHeader.svelte';
	import SiteFooter from '$lib/components/site/SiteFooter.svelte';

	let { data, children } = $props();
</script>

<div class="min-h-screen bg-white text-zinc-900">
	<SiteHeader nav={data.headerNav} userEmail={data.user?.email ?? null} />
	<main id="main" class="mx-auto w-full max-w-6xl px-4 py-10">
		{@render children()}
	</main>
	<SiteFooter />
</div>

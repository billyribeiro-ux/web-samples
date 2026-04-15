<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Member library</title>
</svelte:head>

<div class="mx-auto max-w-3xl px-4 py-12">
	<h1 class="text-3xl font-semibold text-zinc-900">Member library</h1>
	<p class="mt-3 text-zinc-600">
		Gated resources for signed-in members. Premium playbooks unlock with an active subscription.
	</p>

	<div class="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
		{#if data.premium}
			<h2 class="text-lg font-semibold text-zinc-900">Premium collection</h2>
			<p class="mt-2 text-sm text-zinc-600">
				You have active subscriber access. Downloadables and deep dives will appear here as your team
				publishes them from the CMS.
			</p>
		{:else}
			<h2 class="text-lg font-semibold text-zinc-900">Upgrade to unlock</h2>
			<p class="mt-2 text-sm text-zinc-600">
				Subscriber-only templates and workshops are available on paid plans.
			</p>
			<a
				class="mt-4 inline-flex rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white"
				href="/pricing"
			>
				View pricing
			</a>
		{/if}
	</div>
</div>

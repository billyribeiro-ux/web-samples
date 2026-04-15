<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Favorites</title>
</svelte:head>

<h1 class="text-2xl font-semibold text-zinc-900">Favorites</h1>
<p class="mt-2 text-sm text-zinc-600">Saved products.</p>

<ul class="mt-8 grid gap-4 sm:grid-cols-2">
	{#if data.favorites.length === 0}
		<li class="text-sm text-zinc-600">No favorites yet.</li>
	{:else}
		{#each data.favorites as p (p.id)}
			<li class="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
				<a class="font-medium text-zinc-900 hover:text-indigo-600" href="/products/{p.slug}">
					{p.name}
				</a>
				<p class="mt-1 text-sm text-zinc-600">
					${(p.priceCents / 100).toFixed(2)}
					{p.currency.toUpperCase()}
				</p>
			</li>
		{/each}
	{/if}
</ul>

<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Products</title>
</svelte:head>

<h1 class="text-3xl font-semibold text-zinc-900">Products</h1>
<p class="mt-2 text-zinc-600">Digital goods and services ready for Stripe Checkout.</p>

<div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
	{#each data.products as p (p.id)}
		<a
			class="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm hover:border-zinc-300"
			href="/products/{p.slug}"
		>
			<h2 class="text-lg font-semibold text-zinc-900">{p.name}</h2>
			<p class="mt-2 text-sm text-zinc-600 line-clamp-3">
				{p.descriptionHtml.replace(/<[^>]+>/g, '').slice(0, 160)}…
			</p>
			<p class="mt-4 text-sm font-semibold text-zinc-900">
				${(p.priceCents / 100).toFixed(2)}
				{p.currency.toUpperCase()}
			</p>
		</a>
	{/each}
</div>

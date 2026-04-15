<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();
</script>

<svelte:head>
	<title>{data.product.name}</title>
</svelte:head>

<article class="prose prose-zinc max-w-none">
	<h1>{data.product.name}</h1>
	<p class="not-prose text-xl font-semibold text-zinc-900">
		${(data.product.priceCents / 100).toFixed(2)}
		{data.product.currency.toUpperCase()}
	</p>
	{@html data.product.descriptionHtml}
</article>

<form class="not-prose mt-8 flex flex-wrap items-end gap-3" method="POST" action="?/add" use:enhance>
	<div>
		<label class="text-sm font-medium text-zinc-800" for="quantity">Quantity</label>
		<input
			id="quantity"
			name="quantity"
			type="number"
			min="1"
			max="99"
			value="1"
			class="mt-1 w-24 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
		/>
	</div>
	<button
		type="submit"
		class="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
	>
		Add to cart
	</button>
	{#if form?.ok}
		<span class="text-sm text-emerald-700" role="status">Added to cart.</span>
	{/if}
	{#if form?.message}
		<span class="text-sm text-red-600">{form.message}</span>
	{/if}
</form>

<p class="not-prose mt-6">
	<a class="text-sm font-medium text-indigo-600" href="/cart">View cart</a>
</p>

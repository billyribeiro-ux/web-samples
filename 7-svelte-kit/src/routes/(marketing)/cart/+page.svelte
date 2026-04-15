<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();
</script>

<svelte:head>
	<title>Cart</title>
</svelte:head>

<h1 class="text-2xl font-semibold text-zinc-900">Cart</h1>

{#if data.lines.length === 0}
	<p class="mt-4 text-sm text-zinc-600">Your cart is empty.</p>
	<a class="mt-4 inline-flex text-sm font-medium text-indigo-600" href="/products">Browse products</a>
{:else}
	<ul class="mt-6 divide-y divide-zinc-100 rounded-2xl border border-zinc-200 bg-white">
		{#each data.lines as line (`${line.product.id}`)}
			<li class="flex items-center justify-between gap-4 px-4 py-4">
				<div>
					<a class="font-medium text-zinc-900 hover:text-indigo-600" href="/products/{line.product.slug}">
						{line.product.name}
					</a>
					<p class="text-sm text-zinc-600">Qty {line.quantity}</p>
				</div>
				<p class="text-sm font-semibold">
					${((line.product.priceCents * line.quantity) / 100).toFixed(2)}
				</p>
			</li>
		{/each}
	</ul>

	<div class="mt-6 flex items-center justify-between">
		<p class="text-sm text-zinc-600">Estimated total</p>
		<p class="text-lg font-semibold">${(data.totalCents / 100).toFixed(2)}</p>
	</div>

	<form method="POST" action="?/checkout" use:enhance>
		<button
			type="submit"
			class="mt-4 w-full rounded-lg bg-zinc-900 py-3 text-sm font-semibold text-white hover:bg-zinc-800 sm:w-auto sm:px-8"
		>
			Check out with Stripe
		</button>
	</form>
	<p class="mt-2 text-xs text-zinc-500">You need to be signed in to complete checkout.</p>
	{#if form?.message}
		<p class="mt-2 text-sm text-red-600">{form.message}</p>
	{/if}
{/if}

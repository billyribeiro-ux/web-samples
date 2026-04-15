<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Orders</title>
</svelte:head>

<h1 class="text-2xl font-semibold text-zinc-900">Orders</h1>
<p class="mt-2 text-sm text-zinc-600">Your purchase history.</p>

<div class="mt-8 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
	<table class="min-w-full divide-y divide-zinc-200 text-sm">
		<thead class="bg-zinc-50 text-left text-xs font-semibold uppercase text-zinc-500">
			<tr>
				<th class="px-4 py-3">Order</th>
				<th class="px-4 py-3">Status</th>
				<th class="px-4 py-3">Total</th>
				<th class="px-4 py-3">Date</th>
			</tr>
		</thead>
		<tbody class="divide-y divide-zinc-100">
			{#if data.orders.length === 0}
				<tr>
					<td class="px-4 py-6 text-zinc-600" colspan="4">No orders yet.</td>
				</tr>
			{:else}
				{#each data.orders as o (o.id)}
					<tr>
						<td class="px-4 py-3 font-mono text-xs text-zinc-800">{o.id}</td>
						<td class="px-4 py-3 capitalize text-zinc-700">{o.status}</td>
						<td class="px-4 py-3 text-zinc-800">
							{(o.totalCents / 100).toFixed(2)}
							{o.currency.toUpperCase()}
						</td>
						<td class="px-4 py-3 text-zinc-600">{o.createdAt.toLocaleString()}</td>
					</tr>
				{/each}
			{/if}
		</tbody>
	</table>
</div>

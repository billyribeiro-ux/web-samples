<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Orders — Admin</title>
</svelte:head>

<h1 class="text-2xl font-semibold text-zinc-900">Orders</h1>
<div class="mt-8 overflow-auto rounded-xl border border-zinc-200 bg-white">
	<table class="min-w-full text-left text-sm">
		<thead class="border-b bg-zinc-50 text-xs font-semibold uppercase text-zinc-500">
			<tr>
				<th class="px-4 py-3">ID</th>
				<th class="px-4 py-3">Email</th>
				<th class="px-4 py-3">Status</th>
				<th class="px-4 py-3">Total</th>
			</tr>
		</thead>
		<tbody class="divide-y">
			{#each data.orders as o (o.id)}
				<tr>
					<td class="px-4 py-3 font-mono text-xs">{o.id}</td>
					<td class="px-4 py-3">{o.email}</td>
					<td class="px-4 py-3 capitalize">{o.status}</td>
					<td class="px-4 py-3">${(o.totalCents / 100).toFixed(2)}</td>
				</tr>
			{:else}
				<tr>
					<td class="px-4 py-6" colspan="4">No orders.</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

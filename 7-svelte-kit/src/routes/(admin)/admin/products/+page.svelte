<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Products — Admin</title>
</svelte:head>

<h1 class="text-2xl font-semibold text-zinc-900">Products</h1>
<div class="mt-8 overflow-auto rounded-xl border border-zinc-200 bg-white">
	<table class="min-w-full text-left text-sm">
		<thead class="border-b bg-zinc-50 text-xs font-semibold uppercase text-zinc-500">
			<tr>
				<th class="px-4 py-3">Name</th>
				<th class="px-4 py-3">Slug</th>
				<th class="px-4 py-3">Status</th>
				<th class="px-4 py-3">Price</th>
			</tr>
		</thead>
		<tbody class="divide-y">
			{#each data.products as p (p.id)}
				<tr>
					<td class="px-4 py-3 font-medium">{p.name}</td>
					<td class="px-4 py-3 font-mono text-xs">{p.slug}</td>
					<td class="px-4 py-3 capitalize">{p.status}</td>
					<td class="px-4 py-3">${(p.priceCents / 100).toFixed(2)}</td>
				</tr>
			{:else}
				<tr>
					<td class="px-4 py-6" colspan="4">No products.</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

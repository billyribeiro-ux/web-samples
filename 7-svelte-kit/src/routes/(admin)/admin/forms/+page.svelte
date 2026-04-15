<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Leads — Admin</title>
</svelte:head>

<h1 class="text-2xl font-semibold text-zinc-900">Form submissions</h1>

<div class="mt-8 overflow-auto rounded-xl border border-zinc-200 bg-white">
	<table class="min-w-full text-left text-sm">
		<thead class="border-b bg-zinc-50 text-xs font-semibold uppercase text-zinc-500">
			<tr>
				<th class="px-4 py-3">Type</th>
				<th class="px-4 py-3">Payload</th>
				<th class="px-4 py-3">When</th>
			</tr>
		</thead>
		<tbody class="divide-y">
			{#each data.submissions as s (s.id)}
				<tr>
					<td class="px-4 py-3">{s.formType}</td>
					<td class="px-4 py-3 font-mono text-xs text-zinc-700">{JSON.stringify(s.payload)}</td>
					<td class="px-4 py-3 text-zinc-500">{s.createdAt.toLocaleString()}</td>
				</tr>
			{:else}
				<tr>
					<td class="px-4 py-6 text-zinc-600" colspan="3">No submissions yet.</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Users — Admin</title>
</svelte:head>

<h1 class="text-2xl font-semibold text-zinc-900">Users</h1>
<div class="mt-8 overflow-auto rounded-xl border border-zinc-200 bg-white">
	<table class="min-w-full text-left text-sm">
		<thead class="border-b bg-zinc-50 text-xs font-semibold uppercase text-zinc-500">
			<tr>
				<th class="px-4 py-3">Email</th>
				<th class="px-4 py-3">Name</th>
				<th class="px-4 py-3">Verified</th>
			</tr>
		</thead>
		<tbody class="divide-y">
			{#each data.users as u (u.id)}
				<tr>
					<td class="px-4 py-3">{u.email}</td>
					<td class="px-4 py-3">{u.name ?? '—'}</td>
					<td class="px-4 py-3">{u.emailVerified ? 'yes' : 'no'}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Posts — Admin</title>
</svelte:head>

<h1 class="text-2xl font-semibold text-zinc-900">Blog posts</h1>
<p class="mt-2 text-sm text-zinc-600">Draft, schedule, and publish articles.</p>

<div class="mt-8 overflow-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
	<table class="min-w-full text-left text-sm">
		<thead class="border-b border-zinc-100 bg-zinc-50 text-xs font-semibold uppercase text-zinc-500">
			<tr>
				<th class="px-4 py-3">Title</th>
				<th class="px-4 py-3">Status</th>
				<th class="px-4 py-3">Author</th>
				<th class="px-4 py-3">Updated</th>
			</tr>
		</thead>
		<tbody class="divide-y divide-zinc-100">
			{#each data.posts as { post: p, author: a } (`${p.id}`)}
				<tr>
					<td class="px-4 py-3 font-medium text-zinc-900">{p.title}</td>
					<td class="px-4 py-3 capitalize text-zinc-600">{p.status}</td>
					<td class="px-4 py-3 text-zinc-600">{a.name}</td>
					<td class="px-4 py-3 text-zinc-500">{p.updatedAt.toLocaleString()}</td>
				</tr>
			{:else}
				<tr>
					<td class="px-4 py-6 text-zinc-600" colspan="4">No posts yet. Run the seed script.</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

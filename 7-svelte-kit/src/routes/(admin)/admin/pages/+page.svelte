<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Pages — Admin</title>
</svelte:head>

<h1 class="text-2xl font-semibold text-zinc-900">Pages</h1>
<ul class="mt-6 space-y-2">
	{#each data.pages as p (p.id)}
		<li class="rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm">
			<span class="font-medium">{p.title}</span>
			<span class="text-zinc-500"> — /{p.slug}</span>
			<span class="ml-2 rounded bg-zinc-100 px-2 py-0.5 text-xs capitalize">{p.status}</span>
		</li>
	{:else}
		<li class="text-sm text-zinc-600">No CMS pages yet.</li>
	{/each}
</ul>

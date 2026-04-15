<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Categories — Admin</title>
</svelte:head>

<h1 class="text-2xl font-semibold text-zinc-900">Categories</h1>
<ul class="mt-6 space-y-2">
	{#each data.categories as c (c.id)}
		<li class="text-sm">{c.name} <span class="text-zinc-500">({c.slug})</span></li>
	{/each}
</ul>

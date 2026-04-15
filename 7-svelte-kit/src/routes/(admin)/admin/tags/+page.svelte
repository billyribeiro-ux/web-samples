<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Tags — Admin</title>
</svelte:head>

<h1 class="text-2xl font-semibold text-zinc-900">Tags</h1>
<ul class="mt-6 flex flex-wrap gap-2">
	{#each data.tags as t (t.id)}
		<li class="rounded-full bg-zinc-100 px-3 py-1 text-sm">{t.name}</li>
	{/each}
</ul>

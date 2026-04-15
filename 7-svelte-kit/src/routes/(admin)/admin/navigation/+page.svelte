<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Navigation — Admin</title>
</svelte:head>

<h1 class="text-2xl font-semibold text-zinc-900">Navigation menus</h1>
{#each data.menus as m (m.id)}
	<div class="mt-6 rounded-xl border border-zinc-200 bg-white p-4">
		<h2 class="font-semibold">{m.name}</h2>
		<pre class="mt-2 overflow-auto text-xs">{JSON.stringify(m.items, null, 2)}</pre>
	</div>
{/each}

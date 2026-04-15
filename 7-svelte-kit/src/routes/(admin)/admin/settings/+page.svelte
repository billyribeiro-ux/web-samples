<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Settings — Admin</title>
</svelte:head>

<h1 class="text-2xl font-semibold text-zinc-900">Site settings</h1>
<ul class="mt-6 space-y-4">
	{#each data.settings as s (s.key)}
		<li class="rounded-xl border border-zinc-200 bg-white p-4">
			<p class="font-mono text-sm font-semibold">{s.key}</p>
			<pre class="mt-2 text-xs text-zinc-700">{JSON.stringify(s.value, null, 2)}</pre>
		</li>
	{/each}
</ul>

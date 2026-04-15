<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Search</title>
</svelte:head>

<h1 class="text-2xl font-semibold text-zinc-900">Search</h1>

<form class="mt-6 flex gap-2" method="get" action="/search">
	<label class="sr-only" for="q">Query</label>
	<input
		id="q"
		name="q"
		class="w-full max-w-md rounded-lg border border-zinc-300 px-3 py-2 text-sm"
		placeholder="Search posts, pages, products…"
		value={data.q}
	/>
	<button class="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white" type="submit">
		Search
	</button>
</form>

<ul class="mt-8 space-y-4">
	{#each data.results as r (`${r.type}-${r.id}`)}
		<li class="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
			<p class="text-xs font-medium uppercase text-zinc-500">{r.type}</p>
			<a class="mt-1 block font-semibold text-zinc-900 hover:text-indigo-600" href={r.href}>
				{r.title}
			</a>
			{#if r.snippet}
				<p class="mt-1 text-sm text-zinc-600">{r.snippet}</p>
			{/if}
		</li>
	{:else}
		{#if data.q.length >= 2}
			<li class="text-sm text-zinc-600">No results.</li>
		{:else}
			<li class="text-sm text-zinc-600">Enter at least 2 characters.</li>
		{/if}
	{/each}
</ul>

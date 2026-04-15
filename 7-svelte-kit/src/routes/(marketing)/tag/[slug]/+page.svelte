<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>#{data.tag.name} — Blog</title>
</svelte:head>

<h1 class="text-3xl font-semibold text-zinc-900">#{data.tag.name}</h1>

<ul class="mt-8 space-y-6">
	{#each data.posts as p (p.id)}
		<li>
			<a class="text-lg font-semibold text-zinc-900 hover:text-indigo-600" href="/blog/{p.slug}">
				{p.title}
			</a>
			{#if p.excerpt}
				<p class="mt-1 text-sm text-zinc-600">{p.excerpt}</p>
			{/if}
		</li>
	{/each}
</ul>

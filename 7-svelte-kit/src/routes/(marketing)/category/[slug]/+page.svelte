<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>{data.category.name} — Blog</title>
</svelte:head>

<h1 class="text-3xl font-semibold text-zinc-900">{data.category.name}</h1>
{#if data.category.description}
	<p class="mt-2 text-zinc-600">{data.category.description}</p>
{/if}

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

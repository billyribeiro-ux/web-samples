<script lang="ts">
	let { data } = $props();

</script>

<svelte:head>
	<title>{data.meta.title}</title>
	<meta name="description" content={data.meta.description} />
	{#if data.meta.canonicalUrl}
		<link rel="canonical" href={data.meta.canonicalUrl} />
	{/if}
	<meta property="og:title" content={data.meta.title} />
	<meta property="og:description" content={data.meta.description} />
	{#if data.meta.ogImage}
		<meta property="og:image" content={data.meta.ogImage} />
	{/if}
	<meta name="twitter:card" content={data.post.twitterCard ?? 'summary_large_image'} />
</svelte:head>

<article class="prose prose-zinc max-w-none prose-headings:scroll-mt-24">
	<p class="not-prose text-sm text-zinc-500">
		{data.post.publishedAt?.toLocaleDateString()} · {data.author.name} · {data.post.readingMinutes} min read
	</p>
	<h1>{data.post.title}</h1>
	{#if data.categories.length || data.tags.length}
		<p class="not-prose flex flex-wrap gap-2 text-sm">
			{#each data.categories as c (c.id)}
				<a class="rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-700" href="/category/{c.slug}">
					{c.name}
				</a>
			{/each}
			{#each data.tags as t (t.id)}
				<a class="rounded-full border border-zinc-200 px-2 py-0.5 text-zinc-600" href="/tag/{t.slug}">
					#{t.name}
				</a>
			{/each}
		</p>
	{/if}
	{@html data.post.bodyHtml}
</article>

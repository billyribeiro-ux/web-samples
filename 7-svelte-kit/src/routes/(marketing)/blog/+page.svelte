<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Blog — Acme Platform</title>
	<meta name="description" content="Articles on building modern products, growth, and operations." />
</svelte:head>

<h1 class="text-3xl font-semibold tracking-tight text-zinc-900">Blog</h1>
<p class="mt-2 text-zinc-600">Ideas for shipping serious web products.</p>

<ul class="mt-10 space-y-8">
	{#each data.posts as { post: p, author: a } (`${p.id}`)}
		<li class="border-b border-zinc-100 pb-8">
			<p class="text-xs font-medium uppercase tracking-wide text-zinc-500">
				{p.publishedAt ? p.publishedAt.toLocaleDateString() : ''} · {a.name}
			</p>
			<a class="mt-2 block text-xl font-semibold text-zinc-900 hover:text-indigo-600" href="/blog/{p.slug}">
				{p.title}
			</a>
			{#if p.excerpt}
				<p class="mt-2 text-sm text-zinc-600">{p.excerpt}</p>
			{/if}
		</li>
	{/each}
</ul>

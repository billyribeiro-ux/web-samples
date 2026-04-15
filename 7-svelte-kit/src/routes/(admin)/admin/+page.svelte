<svelte:head>
	<title>Admin dashboard</title>
</svelte:head>

<h1 class="text-2xl font-semibold text-zinc-900">Dashboard</h1>
<p class="mt-2 text-sm text-zinc-600">
	Overview of content, commerce, and operations. Use the sidebar to manage entities.
</p>

<div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
	<a
		class="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm hover:border-zinc-300"
		href="/admin/posts"
	>
		<p class="text-sm font-semibold text-zinc-900">Blog posts</p>
		<p class="mt-1 text-sm text-zinc-600">Draft, schedule, and publish.</p>
	</a>
	<a
		class="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm hover:border-zinc-300"
		href="/admin/products"
	>
		<p class="text-sm font-semibold text-zinc-900">Products</p>
		<p class="mt-1 text-sm text-zinc-600">Catalog and Stripe price IDs.</p>
	</a>
	<a
		class="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm hover:border-zinc-300"
		href="/admin/forms"
	>
		<p class="text-sm font-semibold text-zinc-900">Leads</p>
		<p class="mt-1 text-sm text-zinc-600">Form submissions inbox.</p>
	</a>
</div>

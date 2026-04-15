<script lang="ts">
	let { children } = $props();

	const nav = [
		{ href: '/admin', label: 'Dashboard' },
		{ href: '/admin/pages', label: 'Pages' },
		{ href: '/admin/posts', label: 'Posts' },
		{ href: '/admin/categories', label: 'Categories' },
		{ href: '/admin/tags', label: 'Tags' },
		{ href: '/admin/media', label: 'Media' },
		{ href: '/admin/products', label: 'Products' },
		{ href: '/admin/orders', label: 'Orders' },
		{ href: '/admin/subscriptions', label: 'Subscriptions' },
		{ href: '/admin/users', label: 'Users' },
		{ href: '/admin/roles', label: 'Roles' },
		{ href: '/admin/forms', label: 'Leads' },
		{ href: '/admin/navigation', label: 'Navigation' },
		{ href: '/admin/settings', label: 'Settings' },
		{ href: '/admin/seo', label: 'SEO' }
	];
</script>

<div class="min-h-screen bg-zinc-100">
	<div class="flex">
		<aside class="hidden w-56 shrink-0 border-r border-zinc-200 bg-white lg:block">
			<div class="px-4 py-5">
				<p class="text-xs font-semibold uppercase tracking-wide text-zinc-500">CMS</p>
				<nav class="mt-4 flex flex-col gap-1" aria-label="Admin">
					{#each nav as item (item.href)}
						<a
							class="rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
							href={item.href}
						>
							{item.label}
						</a>
					{/each}
				</nav>
			</div>
		</aside>
		<main class="min-w-0 flex-1 p-6 lg:p-10">
			{@render children()}
		</main>
	</div>
</div>

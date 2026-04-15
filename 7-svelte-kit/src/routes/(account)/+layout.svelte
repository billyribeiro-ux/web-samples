<script lang="ts">
	let { data, children } = $props();
	const links = [
		{ href: '/account', label: 'Overview' },
		{ href: '/account/profile', label: 'Profile' },
		{ href: '/account/subscription', label: 'Subscription' },
		{ href: '/account/orders', label: 'Orders' },
		{ href: '/account/favorites', label: 'Favorites' }
	];
</script>

<div class="min-h-screen bg-zinc-50">
	<div class="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 lg:flex-row">
		<aside class="lg:w-56">
			<p class="text-xs font-semibold uppercase tracking-wide text-zinc-500">Account</p>
			<nav class="mt-4 flex flex-col gap-2" aria-label="Account">
				{#each links as l (l.href)}
					<a
						class="rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
						href={l.href}
					>
						{l.label}
					</a>
				{/each}
				<a
					class="rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
					href="/members"
				>
					Member library
				</a>
			</nav>
		</aside>
		<div class="min-w-0 flex-1">
			{@render children()}
		</div>
	</div>
</div>

<script lang="ts">
	import type { NavItem } from '$lib/server/navigation';

	let {
		nav,
		userEmail
	}: {
		nav: NavItem[];
		userEmail: string | null;
	} = $props();
</script>

<header class="border-b border-zinc-200/80 bg-white/80 backdrop-blur">
	<a
		href="#main"
		class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-zinc-900 focus:px-3 focus:py-2 focus:text-white"
	>
		Skip to content
	</a>
	<div class="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-4">
		<a href="/" class="text-lg font-semibold tracking-tight text-zinc-900">Acme Platform</a>
		<nav class="hidden items-center gap-6 md:flex" aria-label="Primary">
			{#each nav as item (item.href)}
				<a
					class="text-sm font-medium text-zinc-600 hover:text-zinc-900"
					href={item.href}
					target={item.external ? '_blank' : undefined}
					rel={item.external ? 'noreferrer noopener' : undefined}
				>
					{item.label}
				</a>
			{/each}
		</nav>
		<div class="flex items-center gap-3">
			<a href="/search" class="text-sm font-medium text-zinc-600 hover:text-zinc-900">Search</a>
			{#if userEmail}
				<a href="/account" class="text-sm font-medium text-zinc-600 hover:text-zinc-900">Account</a>
				<form method="POST" action="/logout">
					<button
						type="submit"
						class="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
					>
						Log out
					</button>
				</form>
			{:else}
				<a href="/login" class="text-sm font-medium text-zinc-600 hover:text-zinc-900">Log in</a>
				<a
					href="/register"
					class="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800"
				>
					Sign up
				</a>
			{/if}
		</div>
	</div>
</header>

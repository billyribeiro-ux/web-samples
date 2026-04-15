<script lang="ts">
	import { page } from '$app/stores';
</script>

<svelte:head>
	<title>{$page.status} — Error</title>
</svelte:head>

<div class="flex min-h-[60vh] flex-col items-center justify-center px-4">
	<p class="text-sm font-medium text-zinc-500">{$page.status}</p>
	<h1 class="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">
		{$page.status === 404 ? 'Page not found' : 'Something went wrong'}
	</h1>
	<p class="mt-2 max-w-md text-center text-zinc-600">
		{$page.error?.message ?? 'An unexpected error occurred.'}
	</p>
	<a
		href="/"
		class="mt-8 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
	>
		Back home
	</a>
</div>

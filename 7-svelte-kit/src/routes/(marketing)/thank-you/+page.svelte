<script lang="ts">
	import { page } from '$app/stores';
</script>

<svelte:head>
	<title>Thank you</title>
</svelte:head>

<div class="mx-auto max-w-lg text-center">
	<h1 class="text-2xl font-semibold text-zinc-900">Thank you</h1>
	<p class="mt-3 text-sm text-zinc-600">
		Your payment is processing. You will receive a confirmation email when Stripe webhooks mark the order
		as paid.
	</p>
	{#if $page.url.searchParams.get('session_id')}
		<p class="mt-4 font-mono text-xs text-zinc-500">
			Session {$page.url.searchParams.get('session_id')}
		</p>
	{/if}
	<a class="mt-8 inline-flex text-sm font-semibold text-indigo-600" href="/account/orders">View orders</a>
</div>

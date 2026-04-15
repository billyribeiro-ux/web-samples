<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Subscription</title>
</svelte:head>

<h1 class="text-2xl font-semibold text-zinc-900">Subscription</h1>
<p class="mt-2 text-sm text-zinc-600">Manage billing in Stripe’s customer portal when configured.</p>

<div class="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
	{#if data.subscription}
		<p class="text-sm text-zinc-700">Status: <span class="font-medium">{data.subscription.status}</span></p>
		{#if data.subscription.currentPeriodEnd}
			<p class="mt-2 text-sm text-zinc-600">
				Current period ends {data.subscription.currentPeriodEnd.toLocaleString()}
			</p>
		{/if}
		<form class="mt-4" method="POST" action="/api/billing/portal">
			<button
				type="submit"
				class="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
			>
				Open billing portal
			</button>
		</form>
	{:else}
		<p class="text-sm text-zinc-600">You do not have an active paid subscription.</p>
		<a class="mt-4 inline-flex text-sm font-semibold text-indigo-600" href="/pricing">View plans</a>
	{/if}
</div>

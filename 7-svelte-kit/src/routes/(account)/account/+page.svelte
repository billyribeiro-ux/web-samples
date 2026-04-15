<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Account</title>
</svelte:head>

<h1 class="text-2xl font-semibold text-zinc-900">Welcome back{data.accountUser.name ? `, ${data.accountUser.name}` : ''}</h1>
<p class="mt-2 text-sm text-zinc-600">
	Email: <span class="font-medium text-zinc-800">{data.accountUser.email}</span>
	{#if data.accountUser.emailVerified}
		<span class="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800">
			Verified
		</span>
	{:else}
		<span class="ml-2 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-900">
			Unverified
		</span>
	{/if}
</p>

<div class="mt-8 grid gap-4 sm:grid-cols-2">
	<div class="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
		<h2 class="text-sm font-semibold text-zinc-900">Subscription</h2>
		{#if data.subscription}
			<p class="mt-2 text-sm text-zinc-600">Status: {data.subscription.status}</p>
		{:else}
			<p class="mt-2 text-sm text-zinc-600">You are on the free member plan.</p>
			<a class="mt-3 inline-flex text-sm font-medium text-indigo-600" href="/pricing">View plans</a>
		{/if}
	</div>
	<div class="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
		<h2 class="text-sm font-semibold text-zinc-900">Quick links</h2>
		<ul class="mt-3 space-y-2 text-sm text-indigo-600">
			<li><a class="hover:text-indigo-500" href="/blog">Read the blog</a></li>
			<li><a class="hover:text-indigo-500" href="/members">Member library</a></li>
		</ul>
	</div>
</div>

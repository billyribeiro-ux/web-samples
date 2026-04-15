<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Pricing</title>
</svelte:head>

<h1 class="text-3xl font-semibold text-zinc-900">Pricing</h1>
<p class="mt-2 text-zinc-600">Simple plans with monthly and yearly billing via Stripe.</p>

<div class="mt-10 grid gap-6 lg:grid-cols-3">
	{#each data.plans as p (p.id)}
		<div class="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
			<h2 class="text-lg font-semibold">{p.name}</h2>
			{#if p.description}
				<p class="mt-2 text-sm text-zinc-600">{p.description}</p>
			{/if}
			<p class="mt-4 text-2xl font-bold text-zinc-900">
				${(p.priceMonthlyCents / 100).toFixed(0)}<span class="text-base font-normal text-zinc-600">/mo</span>
			</p>
			<p class="text-sm text-zinc-600">
				or ${(p.priceYearlyCents / 100).toFixed(0)}/yr
			</p>
			<ul class="mt-4 space-y-2 text-sm text-zinc-700">
				{#each p.features ?? [] as f (f)}
					<li class="flex gap-2">
						<span class="text-emerald-600">✓</span>
						<span>{f}</span>
					</li>
				{/each}
			</ul>
			<a
				class="mt-6 inline-flex w-full justify-center rounded-lg bg-zinc-900 py-2 text-sm font-semibold text-white"
				href="/register"
			>
				Get started
			</a>
		</div>
	{:else}
		<p class="text-sm text-zinc-600">Plans will appear here once seeded.</p>
	{/each}
</div>

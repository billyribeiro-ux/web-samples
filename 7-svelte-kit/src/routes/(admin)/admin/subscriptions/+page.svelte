<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Subscriptions — Admin</title>
</svelte:head>

<h1 class="text-2xl font-semibold text-zinc-900">Subscriptions</h1>
<div class="mt-8 overflow-auto rounded-xl border border-zinc-200 bg-white">
	<table class="min-w-full text-left text-sm">
		<thead class="border-b bg-zinc-50 text-xs font-semibold uppercase text-zinc-500">
			<tr>
				<th class="px-4 py-3">User</th>
				<th class="px-4 py-3">Plan</th>
				<th class="px-4 py-3">Status</th>
				<th class="px-4 py-3">Stripe sub</th>
			</tr>
		</thead>
		<tbody class="divide-y">
			{#each data.subscriptions as s (`${s.subscription.id}`)}
				<tr>
					<td class="px-4 py-3">{s.email}</td>
					<td class="px-4 py-3">{s.planName}</td>
					<td class="px-4 py-3 capitalize">{s.subscription.status}</td>
					<td class="px-4 py-3 font-mono text-xs">{s.subscription.stripeSubscriptionId ?? '—'}</td>
				</tr>
			{:else}
				<tr>
					<td class="px-4 py-6" colspan="4">No subscriptions yet.</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

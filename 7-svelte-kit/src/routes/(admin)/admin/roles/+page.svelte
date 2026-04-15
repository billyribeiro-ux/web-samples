<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Roles — Admin</title>
</svelte:head>

<h1 class="text-2xl font-semibold text-zinc-900">Roles & permissions</h1>
<div class="mt-8 grid gap-6 lg:grid-cols-2">
	<div class="rounded-xl border border-zinc-200 bg-white p-4">
		<h2 class="text-sm font-semibold text-zinc-900">Roles</h2>
		<ul class="mt-2 space-y-1 text-sm">
			{#each data.roles as r (r.id)}
				<li>{r.name}</li>
			{/each}
		</ul>
	</div>
	<div class="rounded-xl border border-zinc-200 bg-white p-4">
		<h2 class="text-sm font-semibold text-zinc-900">Permissions</h2>
		<ul class="mt-2 space-y-1 text-sm font-mono text-xs">
			{#each data.permissions as p (p.id)}
				<li>{p.slug}</li>
			{/each}
		</ul>
	</div>
</div>
<p class="mt-6 text-xs text-zinc-500">
	Mappings: {data.rolePermissionLinks.length} role-permission links loaded.
</p>

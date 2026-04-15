<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Media — Admin</title>
</svelte:head>

<h1 class="text-2xl font-semibold text-zinc-900">Media library</h1>
<p class="mt-2 text-sm text-zinc-600">
	Upload via presigned URL: <code class="rounded bg-zinc-100 px-1">POST /api/admin/presign</code> (admin session
	required), then PUT the file to the returned URL.
</p>
<ul class="mt-6 space-y-2 text-sm">
	{#each data.media as m (m.id)}
		<li class="rounded border border-zinc-200 bg-white px-3 py-2 font-mono text-xs">{m.url}</li>
	{:else}
		<li class="text-zinc-600">No assets yet.</li>
	{/each}
</ul>

<script lang="ts">
	let { children } = $props();
</script>

<div class="min-h-screen bg-zinc-50">
	<div class="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
		<a href="/" class="mb-8 text-center text-sm font-semibold text-zinc-900">Acme Platform</a>
		<div class="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
			{@render children()}
		</div>
	</div>
</div>

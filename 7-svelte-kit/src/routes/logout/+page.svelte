<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	onMount(() => {
		goto('/');
	});
</script>

<p class="p-8 text-center text-sm text-zinc-600">Signing you out…</p>

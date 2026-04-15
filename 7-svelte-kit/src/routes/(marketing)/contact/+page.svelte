<script lang="ts">
	import { enhance } from '$app/forms';

	let { form } = $props();
</script>

<svelte:head>
	<title>Contact</title>
</svelte:head>

<h1 class="text-3xl font-semibold text-zinc-900">Contact</h1>
<p class="mt-2 text-zinc-600">Tell us about your project. We respond within two business days.</p>

<form class="mt-8 max-w-xl space-y-4" method="POST" use:enhance>
	<div>
		<label class="text-sm font-medium text-zinc-800" for="name">Name</label>
		<input
			id="name"
			name="name"
			required
			class="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
		/>
	</div>
	<div>
		<label class="text-sm font-medium text-zinc-800" for="email">Email</label>
		<input
			id="email"
			name="email"
			type="email"
			required
			class="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
		/>
	</div>
	<div>
		<label class="text-sm font-medium text-zinc-800" for="message">Message</label>
		<textarea
			id="message"
			name="message"
			rows="6"
			required
			class="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
		></textarea>
	</div>
	{#if form?.message}
		<p class="text-sm text-red-600">{form.message}</p>
	{/if}
	{#if form?.ok}
		<p class="text-sm text-emerald-700" role="status">Thanks — we received your message.</p>
	{/if}
	<button type="submit" class="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white">
		Send
	</button>
</form>

<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();
</script>

<svelte:head>
	<title>Set a new password</title>
</svelte:head>

<h1 class="text-xl font-semibold text-zinc-900">Choose a new password</h1>

<form class="mt-6 space-y-4" method="POST" use:enhance>
	<input type="hidden" name="token" value={data.token ?? ''} />
	<div>
		<label for="password" class="block text-sm font-medium text-zinc-800">New password</label>
		<input
			id="password"
			name="password"
			type="password"
			autocomplete="new-password"
			required
			minlength="8"
			class="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
		/>
	</div>

	{#if form?.message}
		<p class="text-sm text-red-600" role="alert">{form.message}</p>
	{/if}

	<button
		type="submit"
		class="w-full rounded-lg bg-zinc-900 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800"
	>
		Update password
	</button>
</form>

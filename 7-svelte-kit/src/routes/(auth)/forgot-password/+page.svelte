<script lang="ts">
	import { enhance } from '$app/forms';

	let { form } = $props();
</script>

<svelte:head>
	<title>Forgot password</title>
</svelte:head>

<h1 class="text-xl font-semibold text-zinc-900">Reset password</h1>
<p class="mt-2 text-sm text-zinc-600">We will email you a reset link if the account exists.</p>

<form class="mt-6 space-y-4" method="POST" use:enhance>
	<div>
		<label for="email" class="block text-sm font-medium text-zinc-800">Email</label>
		<input
			id="email"
			name="email"
			type="email"
			autocomplete="email"
			required
			class="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
		/>
	</div>

	{#if form?.message}
		<p class="text-sm text-red-600" role="alert">{form.message}</p>
	{/if}
	{#if form?.ok}
		<p class="text-sm text-emerald-700" role="status">Check your inbox for next steps.</p>
	{/if}

	<button
		type="submit"
		class="w-full rounded-lg bg-zinc-900 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800"
	>
		Send reset link
	</button>
</form>

<p class="mt-6 text-center text-sm">
	<a class="text-indigo-600 hover:text-indigo-500" href="/login">Back to login</a>
</p>

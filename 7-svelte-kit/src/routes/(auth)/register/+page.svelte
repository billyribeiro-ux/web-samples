<script lang="ts">
	import { enhance } from '$app/forms';

	let { form } = $props();
</script>

<svelte:head>
	<title>Create account</title>
</svelte:head>

<h1 class="text-xl font-semibold text-zinc-900">Create your account</h1>
<p class="mt-2 text-sm text-zinc-600">Start with a free member profile. Upgrade anytime.</p>

<form class="mt-6 space-y-4" method="POST" use:enhance>
	<div>
		<label for="name" class="block text-sm font-medium text-zinc-800">Name</label>
		<input
			id="name"
			name="name"
			autocomplete="name"
			required
			class="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
		/>
	</div>
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
	<div>
		<label for="password" class="block text-sm font-medium text-zinc-800">Password</label>
		<input
			id="password"
			name="password"
			type="password"
			autocomplete="new-password"
			required
			minlength="8"
			class="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
		/>
		<p class="mt-1 text-xs text-zinc-500">At least 8 characters.</p>
	</div>

	{#if form?.message}
		<p class="text-sm text-red-600" role="alert">{form.message}</p>
	{/if}

	<button
		type="submit"
		class="w-full rounded-lg bg-zinc-900 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800"
	>
		Create account
	</button>
</form>

<p class="mt-6 text-center text-sm text-zinc-600">
	Already have an account?
	<a class="font-medium text-indigo-600 hover:text-indigo-500" href="/login">Log in</a>
</p>

<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';

	let { form } = $props();
</script>

<svelte:head>
	<title>Profile</title>
</svelte:head>

<h1 class="text-2xl font-semibold text-zinc-900">Profile</h1>

<section class="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
	<h2 class="text-sm font-semibold text-zinc-900">Display name</h2>
	<form class="mt-4 space-y-3" method="POST" action="?/updateProfile" use:enhance>
		<div>
			<label class="text-sm font-medium text-zinc-800" for="name">Name</label>
			<input
				id="name"
				name="name"
				class="mt-1 w-full max-w-md rounded-lg border border-zinc-300 px-3 py-2 text-sm"
				value={$page.data.user?.name ?? ''}
			/>
		</div>
		{#if form?.profileError}
			<p class="text-sm text-red-600">{form.profileError}</p>
		{/if}
		{#if form?.profileOk}
			<p class="text-sm text-emerald-700">Saved.</p>
		{/if}
		<button class="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white" type="submit">
			Save
		</button>
	</form>
</section>

<section class="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
	<h2 class="text-sm font-semibold text-zinc-900">Change password</h2>
	<form class="mt-4 space-y-3" method="POST" action="?/changePassword" use:enhance>
		<div>
			<label class="text-sm font-medium text-zinc-800" for="currentPassword">Current password</label>
			<input
				id="currentPassword"
				name="currentPassword"
				type="password"
				autocomplete="current-password"
				class="mt-1 w-full max-w-md rounded-lg border border-zinc-300 px-3 py-2 text-sm"
			/>
		</div>
		<div>
			<label class="text-sm font-medium text-zinc-800" for="newPassword">New password</label>
			<input
				id="newPassword"
				name="newPassword"
				type="password"
				autocomplete="new-password"
				minlength="8"
				class="mt-1 w-full max-w-md rounded-lg border border-zinc-300 px-3 py-2 text-sm"
			/>
		</div>
		{#if form?.passwordError}
			<p class="text-sm text-red-600">{form.passwordError}</p>
		{/if}
		{#if form?.passwordOk}
			<p class="text-sm text-emerald-700">Password updated.</p>
		{/if}
		<button class="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white" type="submit">
			Update password
		</button>
	</form>
</section>

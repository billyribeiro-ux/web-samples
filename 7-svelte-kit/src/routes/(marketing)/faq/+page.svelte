<svelte:head>
	<title>FAQ</title>
</svelte:head>

<h1 class="text-3xl font-semibold text-zinc-900">FAQ</h1>
<dl class="mt-8 space-y-6">
	<div>
		<dt class="font-semibold text-zinc-900">Is this production-ready?</dt>
		<dd class="mt-2 text-zinc-600">
			Core flows are real (auth, content reads, Stripe checkout, webhooks). Harden rate limits, backups,
			and monitoring before high-traffic launch.
		</dd>
	</div>
	<div>
		<dt class="font-semibold text-zinc-900">Where is media stored?</dt>
		<dd class="mt-2 text-zinc-600">S3-compatible object storage via presigned uploads from the admin API.</dd>
	</div>
</dl>

<script setup lang="ts">
useSeo({ title: 'FAQ', description: 'Common questions about the platform.' })
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-16 space-y-8">
    <h1 class="text-3xl font-semibold text-white">FAQ</h1>
    <details class="rounded-lg border border-slate-800 p-4">
      <summary class="cursor-pointer font-medium text-white">Do you support Stripe subscriptions?</summary>
      <p class="mt-2 text-slate-400 text-sm">Yes — Checkout, Customer Portal, and webhooks are included.</p>
    </details>
    <details class="rounded-lg border border-slate-800 p-4">
      <summary class="cursor-pointer font-medium text-white">Can I self-host?</summary>
      <p class="mt-2 text-slate-400 text-sm">Deploy to any Node host or serverless with Nitro presets.</p>
    </details>
  </div>
</template>

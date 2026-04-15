<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold text-white">Subscriptions</h1>
    <p class="mt-4 text-slate-400 text-sm">Stripe subscription rows synced via webhooks.</p>
  </div>
</template>

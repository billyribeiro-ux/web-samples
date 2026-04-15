<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const { data, refresh } = await useFetch('/api/account/subscription')

async function openPortal() {
  const { url } = await $fetch<{ url: string }>('/api/billing/portal', { method: 'POST' })
  if (url) navigateTo(url, { external: true })
}

useSeo({ title: 'Subscription' })
</script>

<template>
  <div class="max-w-xl mx-auto px-4 py-16">
    <h1 class="text-2xl font-semibold text-white">Subscription</h1>
    <div v-if="data?.subscription" class="mt-6 rounded-lg border border-slate-800 p-4">
      <p class="text-white font-medium">{{ data.subscription.plan.name }}</p>
      <p class="text-sm text-slate-400 mt-1">Status: {{ data.subscription.status }}</p>
      <button type="button" class="mt-4 text-emerald-400 text-sm hover:underline" @click="openPortal">
        Manage billing
      </button>
    </div>
    <p v-else class="mt-6 text-slate-400">
      No active subscription.
      <NuxtLink to="/pricing" class="text-emerald-400">View plans</NuxtLink>
    </p>
  </div>
</template>

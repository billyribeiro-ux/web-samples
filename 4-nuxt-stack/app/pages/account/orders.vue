<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const { data } = await useFetch('/api/account/orders')
useSeo({ title: 'Orders' })
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-16">
    <h1 class="text-2xl font-semibold text-white">Orders</h1>
    <ul class="mt-8 space-y-4">
      <li
        v-for="o in data?.orders ?? []"
        :key="o.id"
        class="rounded-lg border border-slate-800 p-4 flex justify-between"
      >
        <div>
          <p class="text-white">{{ o.id.slice(0, 8) }}…</p>
          <p class="text-xs text-slate-500">{{ new Date(o.createdAt).toLocaleString() }}</p>
        </div>
        <div class="text-right">
          <p class="text-emerald-400">${{ (o.totalCents / 100).toFixed(2) }}</p>
          <p class="text-xs text-slate-500">{{ o.status }}</p>
        </div>
      </li>
    </ul>
  </div>
</template>

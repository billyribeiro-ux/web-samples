<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
const { data } = await useFetch('/api/admin/orders')
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold text-white">Orders</h1>
    <table class="mt-6 w-full text-sm">
      <thead>
        <tr class="text-left text-slate-500 border-b border-slate-800">
          <th class="py-2">ID</th>
          <th class="py-2">Email</th>
          <th class="py-2">Total</th>
          <th class="py-2">Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="o in data?.items ?? []" :key="o.id" class="border-b border-slate-800/80">
          <td class="py-3 font-mono text-xs">{{ o.id.slice(0, 8) }}</td>
          <td class="py-3">{{ o.email }}</td>
          <td class="py-3">${{ (o.totalCents / 100).toFixed(2) }}</td>
          <td class="py-3">{{ o.status }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

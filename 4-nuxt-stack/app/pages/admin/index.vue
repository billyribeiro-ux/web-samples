<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
const { data } = await useFetch('/api/admin/dashboard')
useSeo({ title: 'Admin' })
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold text-white">Dashboard</h1>
    <div class="mt-8 grid sm:grid-cols-4 gap-4">
      <div class="rounded-lg border border-slate-800 p-4">
        <p class="text-slate-400 text-sm">Users</p>
        <p class="text-2xl font-bold text-white">{{ data?.counts?.users }}</p>
      </div>
      <div class="rounded-lg border border-slate-800 p-4">
        <p class="text-slate-400 text-sm">Posts</p>
        <p class="text-2xl font-bold text-white">{{ data?.counts?.posts }}</p>
      </div>
      <div class="rounded-lg border border-slate-800 p-4">
        <p class="text-slate-400 text-sm">Orders</p>
        <p class="text-2xl font-bold text-white">{{ data?.counts?.orders }}</p>
      </div>
      <div class="rounded-lg border border-slate-800 p-4">
        <p class="text-slate-400 text-sm">Leads</p>
        <p class="text-2xl font-bold text-white">{{ data?.counts?.leads }}</p>
      </div>
    </div>
  </div>
</template>

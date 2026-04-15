<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
const { data } = await useFetch('/api/admin/form-submissions')
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold text-white">Form submissions</h1>
    <ul class="mt-6 space-y-3">
      <li
        v-for="f in data?.items ?? []"
        :key="f.id"
        class="rounded-lg border border-slate-800 p-4 text-sm text-slate-300"
      >
        <span class="text-emerald-400">{{ f.type }}</span>
        <span class="text-slate-500 ml-2">{{ new Date(f.createdAt).toLocaleString() }}</span>
        <pre class="mt-2 text-xs overflow-x-auto">{{ JSON.stringify(f.payload, null, 2) }}</pre>
      </li>
    </ul>
  </div>
</template>

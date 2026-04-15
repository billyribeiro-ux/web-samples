<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
const { data } = await useFetch('/api/admin/posts')
useSeo({ title: 'Posts' })
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold text-white">Posts</h1>
    <table class="mt-6 w-full text-sm">
      <thead>
        <tr class="text-left text-slate-500 border-b border-slate-800">
          <th class="py-2">Title</th>
          <th class="py-2">Status</th>
          <th class="py-2">Updated</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in data?.items ?? []" :key="p.id" class="border-b border-slate-800/80">
          <td class="py-3">
            <NuxtLink :to="`/blog/${p.slug}`" class="text-emerald-400 hover:underline">{{ p.title }}</NuxtLink>
          </td>
          <td class="py-3 text-slate-400">{{ p.status }}</td>
          <td class="py-3 text-slate-500">{{ new Date(p.updatedAt).toLocaleDateString() }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

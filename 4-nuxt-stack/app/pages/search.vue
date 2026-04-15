<script setup lang="ts">
const q = ref('')
const { data } = await useAsyncData(
  'site-search',
  () => $fetch<{ hits: unknown[] }>('/api/search', { query: { q: q.value } }),
  { watch: [q] },
)

useSeo({ title: 'Search', description: 'Search articles, pages, and products.' })
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-16">
    <h1 class="text-3xl font-semibold text-white">Search</h1>
    <label class="sr-only" for="q">Query</label>
    <input
      id="q"
      v-model="q"
      type="search"
      class="mt-6 w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-3"
      placeholder="Search the site…"
      autocomplete="off"
    />
    <ul class="mt-8 space-y-3">
      <li v-for="h in data?.hits ?? []" :key="(h as any).type + (h as any).id">
        <NuxtLink :to="(h as any).url" class="text-emerald-400 hover:underline">{{ (h as any).title }}</NuxtLink>
        <span class="text-xs text-slate-500 ml-2">{{ (h as any).type }}</span>
      </li>
    </ul>
  </div>
</template>

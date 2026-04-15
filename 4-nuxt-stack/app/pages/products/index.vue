<script setup lang="ts">
const { data } = await useFetch('/api/products')
useSeo({ title: 'Products', description: 'Guides, sprints, and digital goods.' })
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 py-16">
    <h1 class="text-3xl font-semibold text-white">Products</h1>
    <div class="mt-10 grid sm:grid-cols-2 gap-6">
      <article
        v-for="p in data?.items ?? []"
        :key="p.id"
        class="rounded-xl border border-slate-800 p-6 flex flex-col"
      >
        <h2 class="text-xl font-semibold text-white">{{ p.name }}</h2>
        <p class="mt-2 text-slate-400 text-sm flex-1">{{ p.description.slice(0, 160) }}…</p>
        <p class="mt-4 text-lg font-semibold text-emerald-400">
          ${{ (p.priceCents / 100).toFixed(2) }}
        </p>
        <NuxtLink
          :to="`/products/${p.slug}`"
          class="mt-4 inline-flex justify-center py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm"
        >
          View
        </NuxtLink>
      </article>
    </div>
  </div>
</template>

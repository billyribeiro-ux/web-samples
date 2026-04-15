<script setup lang="ts">
const { data } = await useFetch('/api/pages/about')
useSeo({
  title: data.value?.page?.seoTitle || 'About',
  description: data.value?.page?.seoDescription || '',
})
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-16">
    <h1 class="text-3xl font-semibold text-white">{{ data?.page?.title }}</h1>
    <article
      class="mt-8 prose prose-invert max-w-none text-slate-200 space-y-4"
      v-html="data?.page?.body"
    />
  </div>
</template>

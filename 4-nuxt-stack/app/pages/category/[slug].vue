<script setup lang="ts">
const route = useRoute()
const { data } = await useFetch(() => `/api/categories/${route.params.slug}`)
useSeo({
  title: data.value?.category?.name ? `Category: ${data.value.category.name}` : 'Category',
})
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 py-16">
    <h1 class="text-3xl font-semibold text-white">{{ data?.category?.name }}</h1>
    <ul class="mt-10 space-y-4">
      <li v-for="p in data?.posts ?? []" :key="p.id">
        <NuxtLink :to="`/blog/${p.slug}`" class="text-emerald-400 hover:underline">{{ p.title }}</NuxtLink>
      </li>
    </ul>
  </div>
</template>

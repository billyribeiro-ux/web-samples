<script setup lang="ts">
const { data } = await useFetch('/api/posts', { query: { page: 1 } })
useSeo({ title: 'Blog', description: 'Articles on delivery, growth, and platform craft.' })
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 py-16">
    <h1 class="text-3xl font-semibold text-white">Blog</h1>
    <div class="mt-10 grid gap-8">
      <article
        v-for="post in data?.items ?? []"
        :key="post.id"
        class="rounded-xl border border-slate-800 p-6 hover:border-slate-600 transition"
      >
        <NuxtLink :to="`/blog/${post.slug}`" class="text-xl font-semibold text-white hover:text-emerald-400">
          {{ post.title }}
        </NuxtLink>
        <p class="mt-2 text-slate-400 text-sm">{{ post.excerpt }}</p>
        <p class="mt-3 text-xs text-slate-500">
          {{ post.readingMinutes }} min read
        </p>
      </article>
    </div>
  </div>
</template>

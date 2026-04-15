<script setup lang="ts">
const route = useRoute()
const { data } = await useFetch(() => `/api/posts/${route.params.slug}`)
const post = computed(() => data.value?.post)

watchEffect(() => {
  const p = data.value?.post
  if (!p) return
  useSeo({
    title: p.seoTitle || p.title,
    description: p.seoDescription || p.excerpt || '',
    type: 'article',
    image: p.ogImageUrl || p.featuredImage?.url,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: p.title,
      datePublished: p.publishedAt,
      author: p.author ? { '@type': 'Person', name: p.author.name } : undefined,
    },
  })
})
</script>

<template>
  <div v-if="post" class="max-w-3xl mx-auto px-4 py-16">
    <article>
      <header>
        <p class="text-sm text-emerald-400">{{ post.readingMinutes }} min read</p>
        <h1 class="mt-2 text-4xl font-semibold text-white">{{ post.title }}</h1>
        <p v-if="post.excerpt" class="mt-4 text-lg text-slate-400">{{ post.excerpt }}</p>
      </header>
      <div
        class="mt-10 space-y-4 text-slate-200 leading-relaxed [&_a]:text-emerald-400"
        v-html="post.body"
      />
    </article>
    <section v-if="data?.related?.length" class="mt-16 border-t border-slate-800 pt-10">
      <h2 class="text-lg font-semibold text-white">Related</h2>
      <ul class="mt-4 space-y-2">
        <li v-for="r in data.related" :key="r.id">
          <NuxtLink :to="`/blog/${r.slug}`" class="text-emerald-400 hover:underline">{{ r.title }}</NuxtLink>
        </li>
      </ul>
    </section>
  </div>
</template>

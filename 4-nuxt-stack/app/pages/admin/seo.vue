<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold text-white">SEO</h1>
    <p class="mt-4 text-slate-400 text-sm">Sitemap at <NuxtLink to="/sitemap.xml" class="text-emerald-400">/sitemap.xml</NuxtLink>, RSS at <NuxtLink to="/feed.xml" class="text-emerald-400">/feed.xml</NuxtLink>.</p>
  </div>
</template>

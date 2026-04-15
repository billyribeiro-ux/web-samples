<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useSeo({ title: 'Favorites' })
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-16">
    <h1 class="text-2xl font-semibold text-white">Favorites</h1>
    <p class="mt-4 text-slate-400">Bookmark products from product pages (API hooks ready).</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { api } from "@/lib/api";
const posts = ref<{ title: string; slug: string }[]>([]);

onMounted(async () => {
  posts.value = await api("/api/v1/account/favorites");
});
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold text-white">Favorites</h1>
    <ul class="mt-8 space-y-2">
      <li v-for="p in posts" :key="p.slug">
        <RouterLink class="text-accent-400 hover:underline" :to="`/blog/${p.slug}`">{{ p.title }}</RouterLink>
      </li>
    </ul>
    <p v-if="!posts.length" class="mt-8 text-slate-400">No favorites yet.</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { api } from "@/lib/api";
const posts = ref<{ title: string; slug: string; excerpt: string | null }[]>([]);
const err = ref<string | null>(null);

onMounted(async () => {
  try {
    const r = await api<{ posts: typeof posts.value }>("/api/v1/members/library");
    posts.value = r.posts;
  } catch (e) {
    err.value = e instanceof Error ? e.message : "Access denied";
  }
});
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold text-white">Member library</h1>
    <p v-if="err" class="mt-4 text-red-400">{{ err }}</p>
    <ul v-else class="mt-8 space-y-4">
      <li v-for="p in posts" :key="p.slug" class="rounded-lg border border-white/10 bg-brand-900/40 p-4">
        <RouterLink class="text-lg font-medium text-accent-400 hover:underline" :to="`/blog/${p.slug}`">
          {{ p.title }}
        </RouterLink>
        <p v-if="p.excerpt" class="mt-2 text-sm text-slate-400">{{ p.excerpt }}</p>
      </li>
    </ul>
  </div>
</template>

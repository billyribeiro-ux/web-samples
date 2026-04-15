<script setup lang="ts">
import { onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { apiJson } from "@/lib/api";
import { useSeo } from "@/composables/useSeo";

useSeo({ title: "Blog", description: "Articles on product, growth, and implementation." });

const state = ref<{ items: Record<string, unknown>[]; total: number }>({ items: [], total: 0 });

onMounted(async () => {
  const res = await apiJson<{ items: Record<string, unknown>[]; total: number }>("/posts");
  state.value = { items: res.items, total: res.total };
});
</script>

<template>
  <div class="mx-auto max-w-4xl px-4 py-12">
    <h1 class="text-3xl font-bold text-slate-900">Blog</h1>
    <ul class="mt-10 divide-y divide-slate-200">
      <li v-for="post in state.items" :key="String(post.id)" class="py-8">
        <RouterLink :to="`/blog/${post.slug}`" class="group">
          <h2 class="text-xl font-semibold text-slate-900 group-hover:text-brand-700">{{ post.title }}</h2>
          <p class="mt-2 text-slate-600">{{ post.excerpt }}</p>
          <span class="mt-2 inline-block text-sm font-medium text-brand-600">Read more →</span>
        </RouterLink>
      </li>
    </ul>
  </div>
</template>

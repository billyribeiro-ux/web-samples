<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { apiJson } from "@/lib/api";
import { useSeo } from "@/composables/useSeo";

const route = useRoute();
const state = ref<{ items: Record<string, unknown>[]; total: number }>({ items: [], total: 0 });

async function load() {
  const slug = String(route.params.slug);
  useSeo({ title: `Category: ${slug}`, description: `Posts in ${slug}` });
  const res = await apiJson<{ items: Record<string, unknown>[]; total: number }>(
    `/posts?category=${encodeURIComponent(slug)}`,
  );
  state.value = { items: res.items, total: res.total };
}

onMounted(load);
watch(() => route.params.slug, load);
</script>

<template>
  <div class="mx-auto max-w-4xl px-4 py-12">
    <h1 class="text-3xl font-bold capitalize text-slate-900">{{ route.params.slug }}</h1>
    <ul class="mt-8 divide-y divide-slate-200">
      <li v-for="post in state.items" :key="String(post.id)" class="py-6">
        <RouterLink :to="`/blog/${post.slug}`" class="font-semibold text-slate-900 hover:text-brand-700">
          {{ post.title }}
        </RouterLink>
      </li>
    </ul>
  </div>
</template>

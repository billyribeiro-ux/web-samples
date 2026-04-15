<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { api } from "@/lib/api";
import { useSeo } from "@/composables/useSeo";

const route = useRoute();
const items = ref<
  {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    readingMinutes: number;
  }[]
>([]);

const filter = computed(() => {
  if (route.name === "category") return { category: String(route.params.slug ?? "") };
  if (route.name === "tag") return { tag: String(route.params.slug ?? "") };
  return {};
});

async function load() {
  const q = new URLSearchParams();
  if (filter.value.category) q.set("category", filter.value.category);
  if (filter.value.tag) q.set("tag", filter.value.tag);
  const qs = q.toString();
  const r = await api<{ items: typeof items.value }>(`/api/v1/public/posts${qs ? `?${qs}` : ""}`);
  items.value = r.items;
}

onMounted(load);
watch(() => [route.name, route.params.slug], load);

useSeo({
  title: "Blog",
  description: "Articles and guides.",
  canonicalPath: "/blog",
});
</script>

<template>
  <div class="mx-auto max-w-4xl px-4 py-14">
    <h1 class="text-3xl font-semibold text-white">Blog</h1>
    <ul class="mt-10 space-y-6">
      <li v-for="p in items" :key="p.id">
        <RouterLink :to="`/blog/${p.slug}`" class="block rounded-lg border border-white/10 bg-brand-900/40 p-6 hover:border-accent-500/30">
          <h2 class="text-lg font-medium text-white">{{ p.title }}</h2>
          <p v-if="p.excerpt" class="mt-2 text-sm text-slate-400">{{ p.excerpt }}</p>
          <p class="mt-3 text-xs text-slate-500">{{ p.readingMinutes }} min read</p>
        </RouterLink>
      </li>
    </ul>
  </div>
</template>

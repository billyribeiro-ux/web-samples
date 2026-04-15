<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { apiJson } from "@/lib/api";
import { useSeo } from "@/composables/useSeo";

useSeo({ title: "Search", description: "Search articles, pages, and products." });

const route = useRoute();
const router = useRouter();
const qLocal = ref("");
const hits = ref<{ type: string; title: string; slug: string }[]>([]);

async function fetchHits() {
  const q = qLocal.value.trim();
  if (!q) {
    hits.value = [];
    return;
  }
  const res = await apiJson<{ hits: typeof hits.value }>(`/search?q=${encodeURIComponent(q)}`);
  hits.value = res.hits;
}

async function submit() {
  await router.push({ query: { q: qLocal.value } });
  await fetchHits();
}

onMounted(() => {
  qLocal.value = typeof route.query.q === "string" ? route.query.q : "";
  void fetchHits();
});

watch(
  () => route.query.q,
  () => {
    qLocal.value = typeof route.query.q === "string" ? route.query.q : "";
    void fetchHits();
  },
);
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-12">
    <h1 class="text-3xl font-bold text-slate-900">Search</h1>
    <form class="mt-6 flex gap-2" @submit.prevent="submit">
      <label class="sr-only" for="q">Query</label>
      <input
        id="q"
        v-model="qLocal"
        name="q"
        class="flex-1 rounded-md border border-slate-300 px-3 py-2"
        autocomplete="off"
      />
      <button type="submit" class="rounded-md bg-brand-600 px-4 py-2 text-white">Search</button>
    </form>
    <ul class="mt-8 space-y-4">
      <li v-for="h in hits" :key="h.slug + h.type">
        <RouterLink
          :to="h.type === 'post' ? `/blog/${h.slug}` : h.type === 'product' ? `/services` : `/${h.slug}`"
          class="font-medium text-brand-700 hover:underline"
        >
          {{ h.title }}
        </RouterLink>
        <span class="ml-2 text-xs uppercase text-slate-400">{{ h.type }}</span>
      </li>
    </ul>
    <p v-if="!hits.length && qLocal" class="mt-8 text-slate-500">No results.</p>
  </div>
</template>

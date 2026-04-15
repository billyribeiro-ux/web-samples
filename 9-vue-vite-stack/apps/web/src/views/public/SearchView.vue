<script setup lang="ts">
import { ref } from "vue";
import { RouterLink } from "vue-router";
import { api } from "@/lib/api";
import { useSeo } from "@/composables/useSeo";

const q = ref("");
const hits = ref<{ type: string; title: string; slug: string }[]>([]);

useSeo({ title: "Search", description: "Search posts, pages, and products.", canonicalPath: "/search" });

async function run() {
  const r = await api<{ hits: typeof hits.value }>(`/api/v1/search?q=${encodeURIComponent(q.value)}`);
  hits.value = r.hits;
}
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-14">
    <h1 class="text-3xl font-semibold text-white">Search</h1>
    <form class="mt-6 flex gap-2" @submit.prevent="run">
      <label class="sr-only" for="q">Query</label>
      <input
        id="q"
        v-model="q"
        class="flex-1 rounded-md border border-white/10 bg-brand-900 px-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-400"
        placeholder="Search…"
      />
      <button
        type="submit"
        class="rounded-md bg-accent-500 px-4 py-2 text-sm font-semibold text-brand-950 hover:bg-accent-400"
      >
        Go
      </button>
    </form>
    <ul class="mt-8 space-y-3">
      <li v-for="h in hits" :key="`${h.type}-${h.slug}`" class="text-slate-200">
        <span class="text-xs uppercase text-slate-500">{{ h.type }}</span>
        <RouterLink
          v-if="h.type === 'post'"
          class="ml-2 text-accent-400 hover:underline"
          :to="`/blog/${h.slug}`"
        >
          {{ h.title }}
        </RouterLink>
        <RouterLink
          v-else-if="h.type === 'product'"
          class="ml-2 text-accent-400 hover:underline"
          :to="`/services/${h.slug}`"
        >
          {{ h.title }}
        </RouterLink>
        <span v-else class="ml-2">{{ h.title }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { apiJson } from "@/lib/api";
import { useHead } from "@unhead/vue";
import { computed } from "vue";

const route = useRoute();
const post = ref<Record<string, unknown> | null>(null);

const pageTitle = computed(() => {
  const p = post.value;
  if (!p) return "Blog";
  return ((p.seoTitle as string) || (p.title as string)) as string;
});

useHead({
  title: computed(() => (pageTitle.value ? `${pageTitle.value} · Apex Platform` : "Blog")),
  meta: [
    {
      name: "description",
      content: computed(() => {
        const p = post.value;
        return p ? String(p.seoDescription ?? p.excerpt ?? "") : "";
      }),
    },
  ],
});

async function load() {
  try {
    post.value = await apiJson<Record<string, unknown>>(`/posts/slug/${String(route.params.slug)}`);
  } catch {
    post.value = null;
  }
}

onMounted(load);
watch(() => route.params.slug, load);
</script>

<template>
  <article v-if="post" class="mx-auto max-w-3xl px-4 py-12">
    <header>
      <h1 class="text-4xl font-bold text-slate-900">{{ post.title }}</h1>
      <p v-if="post.excerpt" class="mt-4 text-lg text-slate-600">{{ post.excerpt }}</p>
    </header>
    <div class="cms-content mt-10 max-w-none text-slate-700 [&_p]:mb-4" v-html="(post.body as string) ?? ''" />
  </article>
  <p v-else class="py-20 text-center text-slate-500">Not found.</p>
</template>

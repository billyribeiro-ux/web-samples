<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { api } from "@/lib/api";
import { useSeo } from "@/composables/useSeo";

const route = useRoute();
const slug = computed(() => (route.meta.pageSlug as string) ?? "");
const page = ref<{ title: string; content: string; slug: string } | null>(null);
const err = ref<string | null>(null);

async function load() {
  err.value = null;
  try {
    page.value = await api(`/api/v1/public/pages/${slug.value}`);
  } catch {
    err.value = "Page not found";
    page.value = null;
  }
}

onMounted(load);
watch(slug, load);

watch(page, (p) => {
  if (!p) return;
  const path =
    p.slug === "about"
      ? "/about"
      : p.slug === "privacy-policy"
        ? "/privacy-policy"
        : p.slug === "terms"
          ? "/terms"
          : p.slug === "cookies"
            ? "/cookies"
            : p.slug === "faq"
              ? "/faq"
              : `/${p.slug}`;
  useSeo({ title: p.title, description: p.title, canonicalPath: path });
});
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-14">
    <p v-if="err" class="text-red-400">{{ err }}</p>
    <article v-else-if="page" class="prose-site">
      <h1>{{ page.title }}</h1>
      <div v-html="page.content" />
    </article>
  </div>
</template>

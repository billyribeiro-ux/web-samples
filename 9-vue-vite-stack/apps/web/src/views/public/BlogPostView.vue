<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { api } from "@/lib/api";
import { useSeo } from "@/composables/useSeo";

const route = useRoute();
const post = ref<{
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
} | null>(null);
const related = ref<{ title: string; slug: string }[]>([]);

async function load() {
  const slug = String(route.params.slug ?? "");
  const r = await api<{ post: typeof post.value; related: typeof related.value }>(
    `/api/v1/public/posts/${slug}`
  );
  post.value = r.post;
  related.value = r.related;
  if (post.value) {
    useSeo({
      title: post.value.seoTitle ?? post.value.title,
      description: post.value.seoDescription ?? post.value.excerpt ?? "",
      canonicalPath: `/blog/${slug}`,
    });
  }
}

onMounted(load);
watch(() => route.params.slug, load);
</script>

<template>
  <article v-if="post" class="mx-auto max-w-3xl px-4 py-14">
    <h1 class="text-4xl font-semibold text-white">{{ post.title }}</h1>
    <div class="prose-site mt-10" v-html="post.content" />
    <section v-if="related.length" class="mt-16 border-t border-white/10 pt-10">
      <h2 class="text-lg font-semibold text-white">Related</h2>
      <ul class="mt-4 space-y-2">
        <li v-for="r in related" :key="r.slug">
          <RouterLink class="text-accent-400 hover:underline" :to="`/blog/${r.slug}`">{{ r.title }}</RouterLink>
        </li>
      </ul>
    </section>
  </article>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { api } from "@/lib/api";
import { useSeo } from "@/composables/useSeo";

type Product = { id: string; name: string; slug: string; priceCents: number; currency: string };

const items = ref<Product[]>([]);

useSeo({ title: "Services & products", description: "Digital products and services.", canonicalPath: "/services" });

onMounted(async () => {
  const r = await api<{ items: Product[] }>("/api/v1/public/products?take=24");
  items.value = r.items;
});
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-14">
    <h1 class="text-3xl font-semibold text-white">Services & products</h1>
    <div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <RouterLink
        v-for="p in items"
        :key="p.id"
        :to="`/services/${p.slug}`"
        class="rounded-xl border border-white/10 bg-brand-900/40 p-6 transition hover:border-accent-500/40"
      >
        <h2 class="text-lg font-medium text-white">{{ p.name }}</h2>
        <p class="mt-2 text-sm text-accent-400">
          {{ (p.priceCents / 100).toFixed(2) }} {{ p.currency.toUpperCase() }}
        </p>
      </RouterLink>
    </div>
  </div>
</template>

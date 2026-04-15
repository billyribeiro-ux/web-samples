<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { api } from "@/lib/api";
import { useSeo } from "@/composables/useSeo";

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  currency: string;
};

const route = useRoute();
const router = useRouter();
const product = ref<Product | null>(null);

async function load() {
  const slug = String(route.params.slug ?? "");
  product.value = await api(`/api/v1/public/products/${slug}`);
  if (product.value) {
    useSeo({
      title: product.value.name,
      description: product.value.description.replace(/<[^>]+>/g, "").slice(0, 160),
      canonicalPath: `/services/${slug}`,
    });
  }
}

onMounted(load);
watch(() => route.params.slug, load);

async function addToCart() {
  if (!product.value) return;
  await api("/api/v1/cart/items", {
    method: "POST",
    json: { productId: product.value.id, quantity: 1 },
  });
  await router.push("/cart");
}
</script>

<template>
  <div v-if="product" class="mx-auto max-w-3xl px-4 py-14">
    <h1 class="text-3xl font-semibold text-white">{{ product.name }}</h1>
    <p class="mt-4 text-accent-400">
      {{ (product.priceCents / 100).toFixed(2) }} {{ product.currency.toUpperCase() }}
    </p>
    <div class="prose-site mt-8" v-html="product.description" />
    <button
      type="button"
      class="mt-8 rounded-md bg-accent-500 px-5 py-3 text-sm font-semibold text-brand-950 hover:bg-accent-400"
      @click="addToCart"
    >
      Add to cart
    </button>
  </div>
</template>

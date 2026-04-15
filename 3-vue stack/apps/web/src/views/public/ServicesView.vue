<script setup lang="ts">
import { onMounted, ref } from "vue";
import { apiJson } from "@/lib/api";
import { useSeo } from "@/composables/useSeo";
import { useCartStore } from "@/stores/cart";
import { RouterLink } from "vue-router";

useSeo({ title: "Services & products", description: "Digital products and services designed for conversion." });

const state = ref<{ items: Record<string, unknown>[]; total: number; page: number }>({
  items: [],
  total: 0,
  page: 1,
});
const cart = useCartStore();

onMounted(async () => {
  const res = await apiJson<{ items: Record<string, unknown>[]; total: number; page: number }>(
    "/products?pageSize=12",
  );
  state.value = { items: res.items, total: res.total, page: res.page };
});

function addToCart(p: Record<string, unknown>) {
  cart.add({
    productId: String(p.id),
    name: String(p.name ?? "Product"),
    priceCents: Number(p.priceCents),
  });
}
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-12">
    <h1 class="text-3xl font-bold text-slate-900">Services & products</h1>
    <p class="mt-2 text-slate-600">Explore what we offer — checkout is powered by Stripe-ready APIs.</p>
    <p v-if="cart.totalQuantity > 0" class="mt-4 text-sm text-slate-700">
      <RouterLink to="/cart" class="font-medium text-brand-700 hover:underline">
        Cart: {{ cart.totalQuantity }} item(s)
      </RouterLink>
    </p>
    <div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <article
        v-for="p in state.items"
        :key="String(p.id)"
        class="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <h2 class="text-lg font-semibold text-slate-900">{{ p.name }}</h2>
        <p class="mt-2 line-clamp-3 flex-1 text-sm text-slate-600">
          {{ String(p.description ?? "").replace(/<[^>]+>/g, "") }}
        </p>
        <p class="mt-4 text-lg font-bold text-slate-900">${{ ((p.priceCents as number) / 100).toFixed(2) }}</p>
        <button
          type="button"
          class="mt-4 rounded-md bg-brand-600 py-2 text-sm font-medium text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
          @click="addToCart(p)"
        >
          Add to cart
        </button>
        <RouterLink
          :to="{ name: 'services' }"
          class="mt-2 text-center text-sm text-brand-600 hover:underline"
        >
          Back to top
        </RouterLink>
      </article>
    </div>
  </div>
</template>

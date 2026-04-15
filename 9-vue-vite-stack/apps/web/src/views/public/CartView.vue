<script setup lang="ts">
import { onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { api } from "@/lib/api";
import { useSeo } from "@/composables/useSeo";

type Cart = {
  id: string;
  items: { id: string; quantity: number; product: { name: string; priceCents: number; currency: string } }[];
};

const cart = ref<Cart | null>(null);

useSeo({ title: "Cart", description: "Your cart.", canonicalPath: "/cart" });

onMounted(async () => {
  cart.value = await api<Cart>("/api/v1/cart");
});

async function remove(itemId: string) {
  cart.value = await api<Cart>(`/api/v1/cart/items/${itemId}`, { method: "DELETE" });
}
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-14">
    <h1 class="text-3xl font-semibold text-white">Cart</h1>
    <div v-if="cart && cart.items.length" class="mt-8 space-y-4">
      <div
        v-for="it in cart.items"
        :key="it.id"
        class="flex items-center justify-between rounded-lg border border-white/10 bg-brand-900/40 px-4 py-3"
      >
        <div>
          <p class="font-medium text-white">{{ it.product.name }}</p>
          <p class="text-sm text-slate-400">× {{ it.quantity }}</p>
        </div>
        <div class="flex items-center gap-4">
          <p class="text-accent-400">
            {{ ((it.product.priceCents * it.quantity) / 100).toFixed(2) }}
            {{ it.product.currency.toUpperCase() }}
          </p>
          <button type="button" class="text-sm text-red-400 hover:underline" @click="remove(it.id)">
            Remove
          </button>
        </div>
      </div>
      <RouterLink
        to="/checkout"
        class="inline-block rounded-md bg-accent-500 px-5 py-3 text-sm font-semibold text-brand-950 hover:bg-accent-400"
      >
        Checkout
      </RouterLink>
    </div>
    <p v-else class="mt-8 text-slate-400">Your cart is empty.</p>
  </div>
</template>

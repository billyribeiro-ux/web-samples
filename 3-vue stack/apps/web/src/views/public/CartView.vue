<script setup lang="ts">
import { storeToRefs } from "pinia";
import { RouterLink } from "vue-router";
import { useCartStore } from "@/stores/cart";
import { useSeo } from "@/composables/useSeo";

useSeo({ title: "Cart", description: "Review your cart before checkout." });

const cart = useCartStore();
const { lines } = storeToRefs(cart);
const { remove, totalCents } = cart;
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-12">
    <h1 class="text-3xl font-bold text-slate-900">Cart</h1>
    <ul v-if="lines.length" class="mt-8 divide-y divide-slate-200">
      <li v-for="line in lines" :key="line.productId" class="flex items-center justify-between py-4">
        <div>
          <p class="font-medium text-slate-900">{{ line.name }}</p>
          <p class="text-sm text-slate-500">Qty {{ line.quantity }}</p>
        </div>
        <div class="text-right">
          <p class="font-semibold">${{ ((line.priceCents * line.quantity) / 100).toFixed(2) }}</p>
          <button type="button" class="text-sm text-red-600 hover:underline" @click="remove(line.productId)">
            Remove
          </button>
        </div>
      </li>
    </ul>
    <p v-else class="mt-8 text-slate-600">Your cart is empty.</p>
    <div v-if="lines.length" class="mt-8 flex items-center justify-between border-t border-slate-200 pt-6">
      <p class="text-lg font-semibold">Total</p>
      <p class="text-xl font-bold">${{ (totalCents() / 100).toFixed(2) }}</p>
    </div>
    <RouterLink
      v-if="lines.length"
      to="/checkout"
      class="mt-6 inline-block rounded-md bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700"
    >
      Checkout
    </RouterLink>
  </div>
</template>

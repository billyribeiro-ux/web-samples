<script setup lang="ts">
const cart = useCartStore()
useSeo({ title: 'Cart' })
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-16">
    <h1 class="text-3xl font-semibold text-white">Cart</h1>
    <ul v-if="cart.lines.length" class="mt-8 space-y-4">
      <li
        v-for="line in cart.lines"
        :key="line.productId"
        class="flex justify-between border border-slate-800 rounded-lg p-4"
      >
        <div>
          <NuxtLink :to="`/products/${line.slug}`" class="text-white font-medium">{{ line.title }}</NuxtLink>
          <p class="text-sm text-slate-500">Qty {{ line.quantity }}</p>
        </div>
        <div class="text-right">
          <p class="text-emerald-400">${{ ((line.unitCents * line.quantity) / 100).toFixed(2) }}</p>
          <button type="button" class="text-xs text-red-400 mt-2" @click="cart.remove(line.productId)">
            Remove
          </button>
        </div>
      </li>
    </ul>
    <p v-else class="mt-8 text-slate-500">Your cart is empty.</p>
    <div class="mt-10 flex justify-between items-center">
      <span class="text-lg text-white">Total</span>
      <span class="text-xl font-semibold text-emerald-400">${{ (cart.totalCents / 100).toFixed(2) }}</span>
    </div>
    <NuxtLink
      v-if="cart.lines.length"
      to="/checkout"
      class="mt-6 inline-flex w-full justify-center py-3 rounded-lg bg-emerald-500 text-slate-950 font-semibold"
    >
      Checkout
    </NuxtLink>
  </div>
</template>

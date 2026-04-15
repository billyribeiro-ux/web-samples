<script setup lang="ts">
useSeo({ title: 'Thank you' })
</script>

<template>
  <div class="max-w-xl mx-auto px-4 py-24 text-center">
    <h1 class="text-3xl font-semibold text-white">Thank you</h1>
    <p class="mt-4 text-slate-400">Your order is confirmed. A receipt will be emailed when Stripe is configured.</p>
    <NuxtLink to="/account/orders" class="mt-8 inline-block text-emerald-400 hover:underline">View orders</NuxtLink>
  </div>
</template>

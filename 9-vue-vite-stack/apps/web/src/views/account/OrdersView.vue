<script setup lang="ts">
import { onMounted, ref } from "vue";
import { api } from "@/lib/api";

type Order = {
  id: string;
  status: string;
  totalCents: number;
  currency: string;
  items: { quantity: number; product: { name: string } }[];
};

const orders = ref<Order[]>([]);

onMounted(async () => {
  orders.value = await api<Order[]>("/api/v1/account/orders");
});
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold text-white">Orders</h1>
    <ul class="mt-8 space-y-4">
      <li v-for="o in orders" :key="o.id" class="rounded-lg border border-white/10 bg-brand-900/40 p-4">
        <p class="text-sm text-slate-400">{{ o.id }} · {{ o.status }}</p>
        <p class="mt-2 text-accent-400">{{ (o.totalCents / 100).toFixed(2) }} {{ o.currency.toUpperCase() }}</p>
        <ul class="mt-2 text-sm text-slate-300">
          <li v-for="(it, i) in o.items" :key="i">{{ it.product.name }} × {{ it.quantity }}</li>
        </ul>
      </li>
    </ul>
    <p v-if="!orders.length" class="mt-8 text-slate-400">No orders yet.</p>
  </div>
</template>

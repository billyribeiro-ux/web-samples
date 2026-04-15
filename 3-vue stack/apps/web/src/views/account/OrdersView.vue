<script setup lang="ts">
import { onMounted, ref } from "vue";
import { apiJson } from "@/lib/api";

const orders = ref<Record<string, unknown>[]>([]);

onMounted(async () => {
  const res = await apiJson<{ orders: Record<string, unknown>[] }>("/orders/mine");
  orders.value = res.orders;
});
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-slate-900">Orders</h1>
    <ul class="mt-6 divide-y divide-slate-200">
      <li v-for="o in orders" :key="String(o.id)" class="py-4">
        <p class="font-medium">{{ o.id }}</p>
        <p class="text-sm text-slate-500">{{ o.status }} · {{ o.email }}</p>
      </li>
    </ul>
    <p v-if="!orders.length" class="mt-6 text-slate-600">No orders yet.</p>
  </div>
</template>

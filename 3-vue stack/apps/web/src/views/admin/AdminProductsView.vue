<script setup lang="ts">
import { onMounted, ref } from "vue";
import { apiJson } from "@/lib/api";

const items = ref<Record<string, unknown>[]>([]);

onMounted(async () => {
  const res = await apiJson<{ items: Record<string, unknown>[] }>("/products/admin/all");
  items.value = res.items;
});
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-slate-900">Products</h1>
    <ul class="mt-6 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
      <li v-for="p in items" :key="String(p.id)" class="flex justify-between px-4 py-3">
        <span>{{ p.name }}</span>
        <span class="text-slate-500">${{ ((p.priceCents as number) / 100).toFixed(2) }}</span>
      </li>
    </ul>
  </div>
</template>

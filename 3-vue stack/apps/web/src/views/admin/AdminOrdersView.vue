<script setup lang="ts">
import { onMounted, ref } from "vue";
import { apiJson } from "@/lib/api";

const items = ref<Record<string, unknown>[]>([]);

onMounted(async () => {
  const res = await apiJson<{ items: Record<string, unknown>[] }>("/admin/orders");
  items.value = res.items;
});
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-slate-900">Orders</h1>
    <div class="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table class="min-w-full text-left text-sm">
        <thead class="bg-slate-50">
          <tr>
            <th class="px-4 py-2">ID</th>
            <th class="px-4 py-2">Email</th>
            <th class="px-4 py-2">Status</th>
            <th class="px-4 py-2">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="o in items" :key="String(o.id)" class="border-t border-slate-100">
            <td class="px-4 py-2 font-mono text-xs">{{ o.id }}</td>
            <td class="px-4 py-2">{{ o.email }}</td>
            <td class="px-4 py-2">{{ o.status }}</td>
            <td class="px-4 py-2">${{ ((o.amountCents as number) / 100).toFixed(2) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

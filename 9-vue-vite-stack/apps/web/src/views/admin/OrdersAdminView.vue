<script setup lang="ts">
import { onMounted, ref } from "vue";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();
const orders = ref<{ id: string; status: string; totalCents: number; user: { email: string } | null }[]>([]);

onMounted(async () => {
  orders.value = await api("/api/v1/admin/orders", { headers: auth.headersForWrite() });
});
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold text-slate-900">Orders</h1>
    <table class="mt-8 w-full text-left text-sm">
      <thead>
        <tr class="border-b border-slate-200 text-slate-500">
          <th class="py-2">Customer</th>
          <th class="py-2">Status</th>
          <th class="py-2">Total</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="o in orders" :key="o.id" class="border-b border-slate-100">
          <td class="py-2">{{ o.user?.email ?? "Guest" }}</td>
          <td class="py-2">{{ o.status }}</td>
          <td class="py-2">{{ (o.totalCents / 100).toFixed(2) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

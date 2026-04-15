<script setup lang="ts">
import { onMounted, ref } from "vue";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();
const products = ref<{ name: string; slug: string; priceCents: number; published: boolean }[]>([]);

onMounted(async () => {
  products.value = await api("/api/v1/admin/products", { headers: auth.headersForWrite() });
});
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold text-slate-900">Products</h1>
    <ul class="mt-6 space-y-2 text-sm">
      <li v-for="p in products" :key="p.slug" class="flex justify-between border-b border-slate-100 py-2">
        <span>{{ p.name }}</span>
        <span>{{ (p.priceCents / 100).toFixed(2) }} USD</span>
      </li>
    </ul>
  </div>
</template>

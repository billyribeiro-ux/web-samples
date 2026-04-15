<script setup lang="ts">
import { onMounted, ref } from "vue";
import { apiJson } from "@/lib/api";

const items = ref<Record<string, unknown>[]>([]);

onMounted(async () => {
  const res = await apiJson<{ items: Record<string, unknown>[] }>("/pages/admin/all");
  items.value = res.items;
});
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-slate-900">Pages</h1>
    <ul class="mt-6 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
      <li v-for="p in items" :key="String(p.id)" class="px-4 py-3">
        <span class="font-medium">{{ p.title }}</span>
        <span class="ml-2 text-sm text-slate-500">/{{ p.slug }}</span>
      </li>
    </ul>
  </div>
</template>

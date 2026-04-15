<script setup lang="ts">
import { onMounted, ref } from "vue";
import { apiJson } from "@/lib/api";

const items = ref<Record<string, unknown>[]>([]);

onMounted(async () => {
  const res = await apiJson<{ items: Record<string, unknown>[] }>("/settings/admin");
  items.value = res.items;
});
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-slate-900">Site settings</h1>
    <ul class="mt-6 space-y-2">
      <li v-for="s in items" :key="String(s.id)" class="rounded border border-slate-200 bg-white p-3 text-sm">
        <strong>{{ s.key }}</strong>
        <pre class="mt-2 text-xs text-slate-600">{{ JSON.stringify(s.value, null, 2) }}</pre>
      </li>
    </ul>
  </div>
</template>

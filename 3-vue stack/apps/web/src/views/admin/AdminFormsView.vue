<script setup lang="ts">
import { onMounted, ref } from "vue";
import { apiJson } from "@/lib/api";

const state = ref<{ items: Record<string, unknown>[]; total: number }>({ items: [], total: 0 });

onMounted(async () => {
  const res = await apiJson<{ items: Record<string, unknown>[]; total: number }>("/admin/form-submissions");
  state.value = { items: res.items, total: res.total };
});
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-slate-900">Form submissions</h1>
    <ul class="mt-6 space-y-2">
      <li v-for="s in state.items" :key="String(s.id)" class="rounded border border-slate-200 bg-white p-3 text-sm">
        <span class="font-medium">{{ s.type }}</span>
        <span class="ml-2 text-slate-400">{{ s.createdAt }}</span>
        <pre class="mt-2 max-h-40 overflow-auto text-xs text-slate-600">{{ JSON.stringify(s.payload, null, 2) }}</pre>
      </li>
    </ul>
  </div>
</template>

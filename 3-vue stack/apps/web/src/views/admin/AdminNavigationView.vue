<script setup lang="ts">
import { onMounted, ref } from "vue";
import { apiJson } from "@/lib/api";

const raw = ref("");

onMounted(async () => {
  try {
    const menu = await apiJson<Record<string, unknown>>("/settings/navigation/header");
    raw.value = JSON.stringify(menu.items, null, 2);
  } catch {
    raw.value = "[]";
  }
});
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-slate-900">Navigation (header)</h1>
    <p class="mt-2 text-sm text-slate-600">Read-only preview — update via API or future editor.</p>
    <pre class="mt-6 overflow-auto rounded border border-slate-200 bg-slate-900 p-4 text-xs text-green-400">{{ raw }}</pre>
  </div>
</template>

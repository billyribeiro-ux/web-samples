<script setup lang="ts">
import { onMounted, ref } from "vue";
import { apiJson } from "@/lib/api";

const counts = ref<Record<string, number> | null>(null);

onMounted(async () => {
  const res = await apiJson<{ counts: Record<string, number> }>("/admin/dashboard");
  counts.value = res.counts;
});
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-slate-900">Dashboard</h1>
    <div v-if="counts" class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div v-for="(n, k) in counts" :key="k" class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <p class="text-sm text-slate-500">{{ k }}</p>
        <p class="text-2xl font-bold text-slate-900">{{ n }}</p>
      </div>
    </div>
  </div>
</template>

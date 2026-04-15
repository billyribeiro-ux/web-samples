<script setup lang="ts">
import { onMounted, ref } from "vue";
import { apiJson } from "@/lib/api";

const state = ref<{ items: Record<string, unknown>[]; total: number }>({ items: [], total: 0 });

onMounted(async () => {
  const res = await apiJson<{ items: Record<string, unknown>[]; total: number }>("/media?pageSize=50");
  state.value = { items: res.items, total: res.total };
});
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-slate-900">Media</h1>
    <p class="mt-2 text-sm text-slate-600">Upload via API presign when S3 is configured.</p>
    <div class="mt-6 grid gap-4 sm:grid-cols-3">
      <figure v-for="m in state.items" :key="String(m.id)" class="overflow-hidden rounded border border-slate-200">
        <img v-if="String(m.mimeType).startsWith('image/')" :src="m.url as string" :alt="(m.alt as string) || ''" class="h-32 w-full object-cover" />
        <figcaption class="truncate p-2 text-xs text-slate-600">{{ m.key }}</figcaption>
      </figure>
    </div>
  </div>
</template>

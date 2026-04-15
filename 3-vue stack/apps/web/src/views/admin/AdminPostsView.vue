<script setup lang="ts">
import { onMounted, ref } from "vue";
import { apiJson } from "@/lib/api";

const state = ref<{ items: Record<string, unknown>[]; total: number }>({ items: [], total: 0 });

onMounted(async () => {
  const res = await apiJson<{ items: Record<string, unknown>[]; total: number }>("/posts/admin/all");
  state.value = { items: res.items, total: res.total };
});
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-slate-900">Posts</h1>
    <div class="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table class="min-w-full text-left text-sm">
        <thead class="bg-slate-50 text-slate-600">
          <tr>
            <th class="px-4 py-2">Title</th>
            <th class="px-4 py-2">Slug</th>
            <th class="px-4 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in state.items" :key="String(p.id)" class="border-t border-slate-100">
            <td class="px-4 py-2">{{ p.title }}</td>
            <td class="px-4 py-2 font-mono text-xs">{{ p.slug }}</td>
            <td class="px-4 py-2">{{ p.status }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="mt-4 text-sm text-slate-500">Total {{ state.total }}</p>
  </div>
</template>

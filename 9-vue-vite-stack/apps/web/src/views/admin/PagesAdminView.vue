<script setup lang="ts">
import { onMounted, ref } from "vue";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();
const pages = ref<{ slug: string; title: string; published: boolean }[]>([]);

onMounted(async () => {
  pages.value = await api("/api/v1/admin/pages", { headers: auth.headersForWrite() });
});
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold text-slate-900">Pages</h1>
    <ul class="mt-6 space-y-2 text-sm">
      <li v-for="p in pages" :key="p.slug" class="flex justify-between border-b border-slate-100 py-2">
        <span>{{ p.title }}</span>
        <span class="text-slate-500">{{ p.published ? "Published" : "Draft" }}</span>
      </li>
    </ul>
  </div>
</template>

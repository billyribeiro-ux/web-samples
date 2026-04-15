<script setup lang="ts">
import { onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();
const rows = ref<{ id: string; title: string; slug: string; status: string }[]>([]);

onMounted(async () => {
  const r = await api<{ items: typeof rows.value }>("/api/v1/admin/posts", {
    headers: auth.headersForWrite(),
  });
  rows.value = r.items;
});
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold text-slate-900">Posts</h1>
    <p class="mt-2 text-sm text-slate-600">Sortable tables and CRUD are backed by Prisma.</p>
    <table class="mt-8 w-full text-left text-sm">
      <thead>
        <tr class="border-b border-slate-200 text-slate-500">
          <th class="py-2">Title</th>
          <th class="py-2">Slug</th>
          <th class="py-2">Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in rows" :key="p.id" class="border-b border-slate-100">
          <td class="py-2">
            <RouterLink :to="`/blog/${p.slug}`" class="text-sky-700 hover:underline" target="_blank">{{
              p.title
            }}</RouterLink>
          </td>
          <td class="py-2 font-mono text-xs">{{ p.slug }}</td>
          <td class="py-2">{{ p.status }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

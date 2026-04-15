<script setup lang="ts">
import { onMounted, ref } from "vue";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();
const counts = ref<{ posts: number; orders: number; leads: number } | null>(null);

onMounted(async () => {
  counts.value = (await api<{ counts: typeof counts.value }>("/api/v1/admin/dashboard")).counts;
});
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold text-slate-900">Dashboard</h1>
    <p class="mt-2 text-sm text-slate-600">Signed in as {{ auth.me?.email }}</p>
    <div v-if="counts" class="mt-8 grid gap-4 sm:grid-cols-3">
      <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p class="text-sm text-slate-500">Posts</p>
        <p class="text-2xl font-semibold">{{ counts.posts }}</p>
      </div>
      <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p class="text-sm text-slate-500">Orders</p>
        <p class="text-2xl font-semibold">{{ counts.orders }}</p>
      </div>
      <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p class="text-sm text-slate-500">Form leads</p>
        <p class="text-2xl font-semibold">{{ counts.leads }}</p>
      </div>
    </div>
  </div>
</template>

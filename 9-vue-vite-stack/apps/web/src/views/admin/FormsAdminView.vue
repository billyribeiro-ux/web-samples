<script setup lang="ts">
import { onMounted, ref } from "vue";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();
const rows = ref<{ id: string; type: string; data: unknown; createdAt: string }[]>([]);

onMounted(async () => {
  rows.value = await api("/api/v1/admin/forms", { headers: auth.headersForWrite() });
});
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold text-slate-900">Form submissions</h1>
    <ul class="mt-6 space-y-4 text-sm">
      <li v-for="r in rows" :key="r.id" class="rounded border border-slate-200 p-3">
        <p class="font-medium">{{ r.type }} · {{ r.createdAt }}</p>
        <pre class="mt-2 overflow-x-auto text-xs text-slate-600">{{ JSON.stringify(r.data, null, 2) }}</pre>
      </li>
    </ul>
  </div>
</template>

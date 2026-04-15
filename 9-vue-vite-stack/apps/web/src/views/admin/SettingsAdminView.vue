<script setup lang="ts">
import { onMounted, ref } from "vue";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();
const json = ref("{}");
const saved = ref(false);

onMounted(async () => {
  const data = await api<Record<string, unknown>>("/api/v1/admin/settings", {
    headers: auth.headersForWrite(),
  });
  json.value = JSON.stringify(data, null, 2);
});

async function save() {
  saved.value = false;
  const parsed = JSON.parse(json.value) as Record<string, unknown>;
  for (const [key, value] of Object.entries(parsed)) {
    await api(`/api/v1/admin/settings/${encodeURIComponent(key)}`, {
      method: "PUT",
      headers: auth.headersForWrite(),
      json: { value },
    });
  }
  saved.value = true;
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold text-slate-900">Site settings</h1>
    <p class="mt-2 text-sm text-slate-600">JSON map of SiteSetting keys (demo).</p>
    <textarea
      v-model="json"
      class="mt-6 h-80 w-full rounded border border-slate-200 p-3 font-mono text-xs"
    />
    <button
      type="button"
      class="mt-4 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
      @click="save"
    >
      Save all keys
    </button>
    <p v-if="saved" class="mt-2 text-sm text-emerald-700">Saved.</p>
  </div>
</template>

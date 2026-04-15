<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
const route = useRoute();
const status = ref<"loading" | "ok" | "err">("loading");

onMounted(async () => {
  const token = typeof route.query.token === "string" ? route.query.token : "";
  const res = await fetch(`/api/v1/auth/verify-email?token=${encodeURIComponent(token)}`, { credentials: "include" });
  status.value = res.ok ? "ok" : "err";
});
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-slate-900">Email verification</h1>
    <p v-if="status === 'loading'" class="mt-4 text-slate-600">Verifying…</p>
    <p v-else-if="status === 'ok'" class="mt-4 text-green-700">Email verified. You can log in.</p>
    <p v-else class="mt-4 text-red-600">Link invalid or expired.</p>
  </div>
</template>

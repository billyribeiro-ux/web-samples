<script setup lang="ts">
import { onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();
const sub = ref<{ status: string; plan: { name: string } } | null>(null);

onMounted(async () => {
  sub.value = await api("/api/v1/account/subscription");
});

async function portal() {
  const r = await api<{ url: string | null }>("/api/v1/checkout/portal", {
    method: "POST",
    headers: auth.headersForWrite(),
  });
  if (r.url) window.location.href = r.url;
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold text-white">Subscription</h1>
    <div v-if="sub" class="mt-6 rounded-lg border border-white/10 bg-brand-900/40 p-6">
      <p class="text-slate-300">Plan: <strong class="text-white">{{ sub.plan.name }}</strong></p>
      <p class="mt-2 text-sm text-slate-400">Status: {{ sub.status }}</p>
      <button
        type="button"
        class="mt-4 rounded-md border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/5"
        @click="portal"
      >
        Manage billing
      </button>
    </div>
    <p v-else class="mt-6 text-slate-400">No subscription yet. See <RouterLink class="text-accent-400" to="/pricing">pricing</RouterLink>.</p>
  </div>
</template>

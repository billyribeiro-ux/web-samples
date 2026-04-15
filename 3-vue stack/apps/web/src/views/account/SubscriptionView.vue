<script setup lang="ts">
import { computed, ref } from "vue";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();
const err = ref("");
const planName = computed(() => {
  const sub = auth.user?.subscription as { plan?: { name?: string } } | null | undefined;
  return sub?.plan?.name ?? "";
});

async function openPortal() {
  err.value = "";
  const res = await apiFetch("/checkout/portal-subscription", { method: "POST", body: "{}" });
  const data = await res.json();
  if (data.url) window.location.href = data.url as string;
  else err.value = "Billing portal requires Stripe customer (subscribe first).";
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-slate-900">Subscription</h1>
    <p v-if="auth.user?.subscription" class="mt-4 text-slate-600">
      Current plan: <strong>{{ planName }}</strong>
    </p>
    <p v-else class="mt-4 text-slate-600">You are on the free tier.</p>
    <button
      type="button"
      class="mt-6 rounded-md bg-brand-600 px-4 py-2 text-white hover:bg-brand-700"
      @click="openPortal"
    >
      Manage billing
    </button>
    <p v-if="err" class="mt-4 text-sm text-amber-700">{{ err }}</p>
  </div>
</template>

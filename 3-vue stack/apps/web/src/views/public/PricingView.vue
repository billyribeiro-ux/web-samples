<script setup lang="ts">
import { onMounted, ref } from "vue";
import { apiJson } from "@/lib/api";
import { useSeo } from "@/composables/useSeo";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";

useSeo({ title: "Pricing", description: "Simple plans. Upgrade when you are ready." });

const plans = ref<Record<string, unknown>[]>([]);
const auth = useAuthStore();
const loading = ref(false);
const err = ref("");

onMounted(async () => {
  const res = await apiJson<{ plans: Record<string, unknown>[] }>("/plans");
  plans.value = res.plans;
});

async function subscribe() {
  err.value = "";
  loading.value = true;
  try {
    if (!auth.isAuthenticated) {
      window.location.href = `/register?redirect=${encodeURIComponent("/pricing")}`;
      return;
    }
    const res = await apiFetch("/checkout/subscription-session", { method: "POST", body: "{}" });
    const data = await res.json();
    if (data.url) window.location.href = data.url as string;
    else err.value = "Stripe not configured locally.";
  } catch (e) {
    err.value = e instanceof Error ? e.message : "Could not start checkout";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="mx-auto max-w-5xl px-4 py-16">
    <h1 class="text-center text-4xl font-bold text-slate-900">Pricing</h1>
    <p class="mt-3 text-center text-slate-600">Start free. Scale when your business is ready.</p>
    <div class="mt-12 grid gap-8 md:grid-cols-2">
      <div
        v-for="p in plans"
        :key="String(p.id)"
        class="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
      >
        <h2 class="text-xl font-semibold text-slate-900">{{ p.name }}</h2>
        <p class="mt-2 text-sm text-slate-600">{{ p.description }}</p>
        <p class="mt-6 text-3xl font-bold text-slate-900">
          <span v-if="(p.amountCents as number) === 0">$0</span>
          <span v-else>${{ ((p.amountCents as number) / 100).toFixed(0) }}</span>
          <span class="text-base font-normal text-slate-500">/{{ p.interval }}</span>
        </p>
        <button
          v-if="!(p.isDefaultFree as boolean)"
          type="button"
          class="mt-8 w-full rounded-lg bg-brand-600 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
          :disabled="loading"
          @click="subscribe"
        >
          {{ loading ? "Redirecting…" : "Subscribe" }}
        </button>
        <p v-else class="mt-8 text-sm text-slate-500">Included for every account.</p>
      </div>
    </div>
    <p v-if="err" class="mt-6 text-center text-sm text-red-600">{{ err }}</p>
  </div>
</template>

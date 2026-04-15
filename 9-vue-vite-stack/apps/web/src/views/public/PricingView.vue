<script setup lang="ts">
import { onMounted, ref } from "vue";
import { api } from "@/lib/api";
import { useSeo } from "@/composables/useSeo";
import { useAuthStore } from "@/stores/auth";

type Plan = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  priceMonthlyCents: number;
  priceYearlyCents: number;
};

const plans = ref<Plan[]>([]);
const auth = useAuthStore();

useSeo({ title: "Pricing", description: "Plans and subscriptions.", canonicalPath: "/pricing" });

onMounted(async () => {
  plans.value = await api<Plan[]>("/api/v1/public/plans");
});

async function subscribe(planSlug: string, interval: "month" | "year") {
  if (!auth.isAuthed) {
    window.location.href = `/login?next=${encodeURIComponent("/pricing")}`;
    return;
  }
  const r = await api<{ url: string | null }>("/api/v1/checkout/subscription", {
    method: "POST",
    headers: auth.headersForWrite(),
    json: { planSlug, interval },
  });
  if (r.url) window.location.href = r.url;
}

async function portal() {
  const r = await api<{ url: string | null }>("/api/v1/checkout/portal", {
    method: "POST",
    headers: auth.headersForWrite(),
  });
  if (r.url) window.location.href = r.url;
}
</script>

<template>
  <div class="mx-auto max-w-5xl px-4 py-14">
    <h1 class="text-3xl font-semibold text-white">Pricing</h1>
    <p class="mt-2 text-slate-400">Stripe Checkout powers subscriptions in this demo.</p>
    <div v-if="auth.isAuthed" class="mt-6">
      <button
        type="button"
        class="rounded-md border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/5"
        @click="portal"
      >
        Billing portal
      </button>
    </div>
    <div class="mt-10 grid gap-6 md:grid-cols-2">
      <div
        v-for="p in plans"
        :key="p.id"
        class="rounded-xl border border-white/10 bg-brand-900/50 p-8"
      >
        <h2 class="text-xl font-semibold text-white">{{ p.name }}</h2>
        <p v-if="p.description" class="mt-2 text-sm text-slate-400">{{ p.description }}</p>
        <p class="mt-6 text-3xl font-semibold text-accent-400">
          {{ p.priceMonthlyCents === 0 ? "Free" : `$${(p.priceMonthlyCents / 100).toFixed(0)}/mo` }}
        </p>
        <div v-if="p.slug !== 'free'" class="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            class="rounded-md bg-accent-500 px-4 py-2 text-sm font-medium text-brand-950 hover:bg-accent-400"
            @click="subscribe(p.slug, 'month')"
          >
            Subscribe monthly
          </button>
          <button
            type="button"
            class="rounded-md border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/5"
            @click="subscribe(p.slug, 'year')"
          >
            Yearly
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

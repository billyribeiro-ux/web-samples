<script setup lang="ts">
import { onMounted, ref } from "vue";
import { apiJson } from "@/lib/api";

const plans = ref<Record<string, unknown>[]>([]);

onMounted(async () => {
  const res = await apiJson<{ plans: Record<string, unknown>[] }>("/plans");
  plans.value = res.plans;
});
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-slate-900">Plans</h1>
    <p class="mt-2 text-sm text-slate-600">Stripe price IDs are configured in the database and environment.</p>
    <ul class="mt-6 space-y-2">
      <li v-for="p in plans" :key="String(p.id)" class="rounded border border-slate-200 bg-white px-4 py-3">
        {{ p.name }} — {{ p.slug }} — ${{ ((p.amountCents as number) / 100).toFixed(2) }}/{{ p.interval }}
      </li>
    </ul>
  </div>
</template>

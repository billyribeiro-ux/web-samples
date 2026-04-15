<script setup lang="ts">
import { RouterLink } from "vue-router";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { apiFetch, apiJson } from "@/lib/api";
import { useSeo } from "@/composables/useSeo";

useSeo({ title: "Thank you", description: "Your purchase was received." });

const route = useRoute();
const order = ref<Record<string, unknown> | null>(null);

onMounted(async () => {
  const sessionId = typeof route.query.session_id === "string" ? route.query.session_id : "";
  if (sessionId) {
    await apiFetch("/checkout/finalize-session", {
      method: "POST",
      body: JSON.stringify({ sessionId }),
    });
    try {
      order.value = await apiJson<Record<string, unknown>>(`/checkout/order-by-session/${sessionId}`);
    } catch {
      order.value = null;
    }
  }
});
</script>

<template>
  <div class="mx-auto max-w-xl px-4 py-20 text-center">
    <h1 class="text-3xl font-bold text-slate-900">Thank you</h1>
    <p class="mt-4 text-slate-600">Your order is being processed.</p>
    <p v-if="order" class="mt-4 text-sm text-slate-500">Order reference: {{ order.id }}</p>
    <RouterLink to="/account/orders" class="mt-8 inline-block text-brand-600 hover:underline">View orders</RouterLink>
  </div>
</template>

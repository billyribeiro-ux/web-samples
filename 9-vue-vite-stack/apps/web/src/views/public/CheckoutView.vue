<script setup lang="ts">
import { ref } from "vue";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
import { useSeo } from "@/composables/useSeo";

const auth = useAuthStore();
const error = ref<string | null>(null);

useSeo({ title: "Checkout", description: "Complete purchase.", canonicalPath: "/checkout" });

async function pay() {
  error.value = null;
  try {
    const r = await api<{ url: string | null }>("/api/v1/checkout/cart", {
      method: "POST",
      ...(auth.isAuthed ? { headers: auth.headersForWrite() } : {}),
    });
    if (r.url) window.location.href = r.url;
    else error.value = "Could not start checkout";
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Error";
  }
}
</script>

<template>
  <div class="mx-auto max-w-xl px-4 py-14">
    <h1 class="text-3xl font-semibold text-white">Checkout</h1>
    <p class="mt-4 text-slate-400">You will be redirected to Stripe Checkout (configure keys in API).</p>
    <p v-if="error" class="mt-4 text-sm text-red-400">{{ error }}</p>
    <button
      type="button"
      class="mt-8 rounded-md bg-accent-500 px-5 py-3 text-sm font-semibold text-brand-950 hover:bg-accent-400"
      @click="pay"
    >
      Pay with Stripe
    </button>
  </div>
</template>

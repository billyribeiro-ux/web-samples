<script setup lang="ts">
import { RouterLink } from "vue-router";
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { useCartStore } from "@/stores/cart";
import { apiFetch } from "@/lib/api";
import { useSeo } from "@/composables/useSeo";

useSeo({ title: "Checkout", description: "Secure checkout via Stripe." });

const cart = useCartStore();
const { lines } = storeToRefs(cart);
const email = ref("");
const err = ref("");
const loading = ref(false);

async function pay() {
  err.value = "";
  loading.value = true;
  try {
    const res = await apiFetch("/checkout/create-session", {
      method: "POST",
      body: JSON.stringify({
        items: lines.value.map((l) => ({ productId: l.productId, quantity: l.quantity })),
        email: email.value || undefined,
        successPath: "/thank-you",
      }),
    });
    const data = await res.json();
    if (data.url) {
      cart.clear();
      window.location.href = data.url as string;
    } else {
      err.value = (data.error as string) || "Checkout unavailable (configure Stripe).";
    }
  } catch (e) {
    err.value = e instanceof Error ? e.message : "Error";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="mx-auto max-w-lg px-4 py-12">
    <h1 class="text-3xl font-bold text-slate-900">Checkout</h1>
    <p class="mt-2 text-slate-600">You will be redirected to Stripe Checkout.</p>
    <div v-if="!lines.length" class="mt-8 text-slate-600">
      Cart is empty.
      <RouterLink to="/services" class="text-brand-600 hover:underline">Browse services</RouterLink>
    </div>
    <form v-else class="mt-8 space-y-4" @submit.prevent="pay">
      <div>
        <label class="block text-sm font-medium text-slate-700" for="email">Email for receipt</label>
        <input
          id="email"
          v-model="email"
          type="email"
          required
          class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
        />
      </div>
      <button
        type="submit"
        class="w-full rounded-md bg-brand-600 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        :disabled="loading"
      >
        {{ loading ? "Redirecting…" : "Continue to payment" }}
      </button>
      <p v-if="err" class="text-sm text-red-600">{{ err }}</p>
    </form>
  </div>
</template>

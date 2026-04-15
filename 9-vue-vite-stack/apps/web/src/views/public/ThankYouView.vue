<script setup lang="ts">
import { RouterLink } from "vue-router";
import { useSeo } from "@/composables/useSeo";

useSeo({ title: "Thank you", description: "Purchase complete.", canonicalPath: "/thank-you" });
</script>

<template>
  <div class="mx-auto max-w-xl px-4 py-20 text-center">
    <h1 class="text-3xl font-semibold text-white">Thank you</h1>
    <p class="mt-4 text-slate-400">Your payment session completed (demo).</p>
    <RouterLink to="/account/orders" class="mt-8 inline-block text-accent-400 hover:underline">
      View orders
    </RouterLink>
  </div>
</template>

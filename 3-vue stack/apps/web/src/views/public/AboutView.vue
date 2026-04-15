<script setup lang="ts">
import { useSeo } from "@/composables/useSeo";

useSeo({
  title: "About",
  description: "We help teams ship premium digital experiences with disciplined engineering.",
});
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-16">
    <h1 class="text-4xl font-bold text-slate-900">About Apex</h1>
    <p class="mt-6 text-lg text-slate-600">
      We combine product thinking with robust implementation — so your marketing site, blog, and commerce flows feel like
      one coherent product.
    </p>
  </div>
</template>

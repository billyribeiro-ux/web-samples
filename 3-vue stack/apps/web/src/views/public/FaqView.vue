<script setup lang="ts">
import { useSeo } from "@/composables/useSeo";

useSeo({ title: "FAQ", description: "Common questions about the platform." });

const faqs = [
  { q: "Is billing handled securely?", a: "Yes — card data never touches our servers when using Stripe Checkout." },
  { q: "Can I self-host the API?", a: "The API is a Node service you can deploy to Railway, Render, Fly.io, or similar." },
];
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-16">
    <h1 class="text-3xl font-bold text-slate-900">FAQ</h1>
    <dl class="mt-10 space-y-8">
      <div v-for="(item, i) in faqs" :key="i">
        <dt class="font-semibold text-slate-900">{{ item.q }}</dt>
        <dd class="mt-2 text-slate-600">{{ item.a }}</dd>
      </div>
    </dl>
  </div>
</template>

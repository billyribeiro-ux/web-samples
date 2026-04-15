<script setup lang="ts">
import { RouterLink } from "vue-router";
import { useSeo } from "@/composables/useSeo";

useSeo({ title: "Page not found", description: "The page you requested does not exist." });
</script>

<template>
  <div class="mx-auto max-w-xl px-4 py-24 text-center">
    <p class="text-sm font-semibold uppercase text-brand-600">404</p>
    <h1 class="mt-2 text-3xl font-bold text-slate-900">Page not found</h1>
    <RouterLink to="/" class="mt-8 inline-block font-medium text-brand-600 hover:underline">Go home</RouterLink>
  </div>
</template>

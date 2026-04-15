<script setup lang="ts">
import { RouterLink } from "vue-router";
import { useSeo } from "@/composables/useSeo";

useSeo({ title: "Not found", description: "404" });
</script>

<template>
  <div class="mx-auto max-w-xl px-4 py-24 text-center">
    <h1 class="text-4xl font-semibold text-white">404</h1>
    <p class="mt-4 text-slate-400">This page does not exist.</p>
    <RouterLink class="mt-8 inline-block text-accent-400 hover:underline" to="/">Go home</RouterLink>
  </div>
</template>

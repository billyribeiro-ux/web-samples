<script setup lang="ts">
import { useSeo } from "@/composables/useSeo";

useSeo({ title: "Member library", description: "Subscriber-only resources." });
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-16">
    <h1 class="text-3xl font-bold text-slate-900">Member library</h1>
    <p class="mt-4 text-slate-600">
      This area is gated by subscription rules. Add downloadable assets and long-form guides here in your CMS workflow.
    </p>
  </div>
</template>

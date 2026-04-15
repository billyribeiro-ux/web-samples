<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>

<template>
  <div class="flex min-h-screen flex-col bg-slate-100">
    <header class="border-b border-slate-200 bg-white">
      <div class="mx-auto flex max-w-lg items-center justify-between px-4 py-4">
        <RouterLink to="/" class="text-lg font-semibold text-brand-700">Apex Platform</RouterLink>
        <RouterLink to="/" class="text-sm text-slate-600 hover:text-brand-600">Back to site</RouterLink>
      </div>
    </header>
    <div class="flex flex-1 items-center justify-center p-4">
      <div class="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <RouterView />
      </div>
    </div>
  </div>
</template>

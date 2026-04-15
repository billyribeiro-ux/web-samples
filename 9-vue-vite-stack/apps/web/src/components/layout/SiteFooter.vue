<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>

<template>
  <footer class="border-t border-white/10 bg-brand-900 py-10 text-sm text-slate-400">
    <div class="mx-auto flex max-w-6xl flex-col gap-6 px-4 md:flex-row md:justify-between">
      <div>
        <p class="font-medium text-slate-200">Apex Platform</p>
        <p class="mt-1 max-w-md">Demo stack: Vue SPA, Express, Prisma, Stripe-ready flows.</p>
      </div>
      <div class="flex flex-wrap gap-4">
        <RouterLink class="hover:text-white" to="/privacy-policy">Privacy</RouterLink>
        <RouterLink class="hover:text-white" to="/terms">Terms</RouterLink>
        <RouterLink class="hover:text-white" to="/cookies">Cookies</RouterLink>
        <RouterLink class="hover:text-white" to="/faq">FAQ</RouterLink>
      </div>
    </div>
  </footer>
</template>

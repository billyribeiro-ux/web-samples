<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>

<template>
  <footer class="border-t border-slate-200 bg-white">
    <div class="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
      <div>
        <p class="font-semibold text-slate-900">Apex Platform</p>
        <p class="mt-2 text-sm text-slate-600">A credible, conversion-focused digital presence.</p>
      </div>
      <div>
        <p class="text-sm font-medium text-slate-900">Explore</p>
        <ul class="mt-2 space-y-1 text-sm text-slate-600">
          <li><RouterLink class="hover:text-brand-600" to="/faq">FAQ</RouterLink></li>
          <li><RouterLink class="hover:text-brand-600" to="/search">Search</RouterLink></li>
          <li><RouterLink class="hover:text-brand-600" to="/members">Members</RouterLink></li>
        </ul>
      </div>
      <div>
        <p class="text-sm font-medium text-slate-900">Legal</p>
        <ul class="mt-2 space-y-1 text-sm text-slate-600">
          <li><RouterLink class="hover:text-brand-600" to="/privacy-policy">Privacy</RouterLink></li>
          <li><RouterLink class="hover:text-brand-600" to="/terms">Terms</RouterLink></li>
          <li><RouterLink class="hover:text-brand-600" to="/cookies">Cookies</RouterLink></li>
        </ul>
      </div>
    </div>
    <div class="border-t border-slate-100 py-4 text-center text-xs text-slate-500">
      © {{ new Date().getFullYear() }} Apex Platform
    </div>
  </footer>
</template>

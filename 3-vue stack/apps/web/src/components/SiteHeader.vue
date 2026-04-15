<script setup lang="ts">
import { RouterLink } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useCartStore } from "@/stores/cart";

const auth = useAuthStore();
const cart = useCartStore();
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur">
    <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
      <RouterLink to="/" class="text-xl font-semibold tracking-tight text-slate-900">
        Apex<span class="text-brand-600">.</span>
      </RouterLink>
      <nav class="hidden items-center gap-6 md:flex" aria-label="Primary">
        <RouterLink class="text-sm font-medium text-slate-600 hover:text-brand-700" to="/services">Services</RouterLink>
        <RouterLink class="text-sm font-medium text-slate-600 hover:text-brand-700" to="/pricing">Pricing</RouterLink>
        <RouterLink class="text-sm font-medium text-slate-600 hover:text-brand-700" to="/blog">Blog</RouterLink>
        <RouterLink class="text-sm font-medium text-slate-600 hover:text-brand-700" to="/contact">Contact</RouterLink>
      </nav>
      <div class="flex items-center gap-3">
        <RouterLink
          to="/cart"
          class="relative rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Cart
          <span
            v-if="cart.totalQuantity > 0"
            class="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white"
          >
            {{ cart.totalQuantity > 99 ? "99+" : cart.totalQuantity }}
          </span>
        </RouterLink>
        <template v-if="auth.isAuthenticated">
          <RouterLink
            v-if="auth.isAdmin"
            to="/admin"
            class="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            Admin
          </RouterLink>
          <RouterLink
            to="/account"
            class="rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
          >
            Account
          </RouterLink>
        </template>
        <template v-else>
          <RouterLink to="/login" class="text-sm font-medium text-slate-600 hover:text-brand-700">Log in</RouterLink>
          <RouterLink
            to="/register"
            class="rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
          >
            Sign up
          </RouterLink>
        </template>
      </div>
    </div>
  </header>
</template>

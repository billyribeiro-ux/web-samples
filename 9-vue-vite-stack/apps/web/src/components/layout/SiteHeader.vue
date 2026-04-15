<script setup lang="ts">
import { onMounted, ref } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();
const route = useRoute();
const items = ref<{ label: string; href: string }[]>([]);

onMounted(async () => {
  try {
    const r = await api<{ items: { label: string; href: string }[] }>("/api/v1/public/nav/header");
    items.value = r.items ?? [];
  } catch {
    items.value = [
      { label: "Home", href: "/" },
      { label: "About", href: "/about" },
      { label: "Services", href: "/services" },
      { label: "Pricing", href: "/pricing" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
    ];
  }
});

function isActive(href: string) {
  if (href === "/") return route.path === "/";
  return route.path.startsWith(href);
}
</script>

<template>
  <header class="border-b border-white/10 bg-brand-900/80 backdrop-blur">
    <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
      <RouterLink to="/" class="text-lg font-semibold tracking-tight text-white">
        Apex Platform
      </RouterLink>
      <nav class="hidden items-center gap-1 md:flex" aria-label="Primary">
        <RouterLink
          v-for="it in items"
          :key="it.href"
          :to="it.href"
          class="rounded-md px-3 py-2 text-sm font-medium text-slate-200 hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
          :class="isActive(it.href) ? 'bg-white/10 text-white' : ''"
        >
          {{ it.label }}
        </RouterLink>
      </nav>
      <div class="flex items-center gap-2">
        <RouterLink
          v-if="auth.isAuthed && auth.me?.permissions?.includes('posts.read')"
          to="/admin"
          class="rounded-md px-3 py-2 text-sm text-accent-400 hover:bg-white/5"
        >
          Admin
        </RouterLink>
        <RouterLink
          v-if="auth.isAuthed"
          to="/account"
          class="rounded-md px-3 py-2 text-sm text-slate-200 hover:bg-white/5"
        >
          Account
        </RouterLink>
        <RouterLink
          v-else
          to="/login"
          class="rounded-md bg-accent-500 px-3 py-2 text-sm font-medium text-brand-950 hover:bg-accent-400"
        >
          Log in
        </RouterLink>
      </div>
    </div>
  </header>
</template>

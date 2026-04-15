<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();
const router = useRouter();

async function signOut() {
  await auth.logout();
  await router.push("/");
}

const links = [
  { to: "/account", label: "Overview" },
  { to: "/account/profile", label: "Profile" },
  { to: "/account/subscription", label: "Subscription" },
  { to: "/account/orders", label: "Orders" },
  { to: "/account/favorites", label: "Favorites" },
];
</script>

<template>
  <div class="min-h-screen bg-slate-100">
    <header class="border-b border-slate-200 bg-white">
      <div class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <RouterLink to="/" class="font-semibold text-brand-700">Apex Platform</RouterLink>
        <nav class="flex flex-wrap gap-4 text-sm">
          <RouterLink
            v-for="l in links"
            :key="l.to"
            :to="l.to"
            class="text-slate-600 hover:text-brand-600"
            active-class="font-medium text-brand-700"
          >
            {{ l.label }}
          </RouterLink>
          <button type="button" class="text-slate-500 hover:text-brand-600" @click="signOut">Sign out</button>
        </nav>
      </div>
    </header>
    <div class="mx-auto max-w-6xl px-4 py-10">
      <RouterView />
    </div>
  </div>
</template>

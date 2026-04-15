<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();
const router = useRouter();

async function signOut() {
  await auth.logout();
  await router.push("/");
}
</script>

<template>
  <div class="min-h-screen bg-brand-950">
    <header class="border-b border-white/10 bg-brand-900">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <RouterLink to="/" class="text-white hover:text-accent-400">← Back to site</RouterLink>
        <button type="button" class="text-sm text-slate-300 hover:text-white" @click="signOut">
          Log out
        </button>
      </div>
    </header>
    <div class="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-[220px_1fr]">
      <aside class="space-y-1 text-sm">
        <RouterLink
          to="/account"
          class="block rounded-md px-3 py-2 text-slate-300 hover:bg-white/5 hover:text-white"
          active-class="bg-white/10 text-white"
        >
          Overview
        </RouterLink>
        <RouterLink
          to="/account/profile"
          class="block rounded-md px-3 py-2 text-slate-300 hover:bg-white/5 hover:text-white"
          active-class="bg-white/10 text-white"
        >
          Profile
        </RouterLink>
        <RouterLink
          to="/account/subscription"
          class="block rounded-md px-3 py-2 text-slate-300 hover:bg-white/5 hover:text-white"
          active-class="bg-white/10 text-white"
        >
          Subscription
        </RouterLink>
        <RouterLink
          to="/account/orders"
          class="block rounded-md px-3 py-2 text-slate-300 hover:bg-white/5 hover:text-white"
          active-class="bg-white/10 text-white"
        >
          Orders
        </RouterLink>
        <RouterLink
          to="/account/favorites"
          class="block rounded-md px-3 py-2 text-slate-300 hover:bg-white/5 hover:text-white"
          active-class="bg-white/10 text-white"
        >
          Favorites
        </RouterLink>
        <RouterLink
          to="/members"
          class="block rounded-md px-3 py-2 text-slate-300 hover:bg-white/5 hover:text-white"
          active-class="bg-white/10 text-white"
        >
          Member library
        </RouterLink>
      </aside>
      <section>
        <RouterView />
      </section>
    </div>
  </div>
</template>

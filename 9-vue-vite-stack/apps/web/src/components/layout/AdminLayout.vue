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
  { to: "/admin", label: "Dashboard" },
  { to: "/admin/posts", label: "Posts" },
  { to: "/admin/pages", label: "Pages" },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/forms", label: "Leads" },
  { to: "/admin/media", label: "Media" },
  { to: "/admin/settings", label: "Settings" },
];
</script>

<template>
  <div class="min-h-screen bg-slate-100 text-slate-900">
    <header class="border-b border-slate-200 bg-white">
      <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <RouterLink to="/admin" class="font-semibold">CMS</RouterLink>
        <div class="flex items-center gap-3 text-sm">
          <RouterLink class="text-slate-600 hover:text-slate-900" to="/">View site</RouterLink>
          <button type="button" class="text-slate-600 hover:text-slate-900" @click="signOut">
            Log out
          </button>
        </div>
      </div>
    </header>
    <div class="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:grid-cols-[200px_1fr]">
      <nav class="space-y-1 text-sm">
        <RouterLink
          v-for="l in links"
          :key="l.to"
          :to="l.to"
          class="block rounded-md px-3 py-2 text-slate-600 hover:bg-slate-200/60"
          active-class="bg-slate-200 font-medium text-slate-900"
        >
          {{ l.label }}
        </RouterLink>
      </nav>
      <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <RouterView />
      </div>
    </div>
  </div>
</template>

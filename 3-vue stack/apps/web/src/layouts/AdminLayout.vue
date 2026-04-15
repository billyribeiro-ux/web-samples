<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";

const nav = [
  { to: "/admin", label: "Dashboard" },
  { to: "/admin/posts", label: "Posts" },
  { to: "/admin/pages", label: "Pages" },
  { to: "/admin/categories", label: "Categories" },
  { to: "/admin/tags", label: "Tags" },
  { to: "/admin/media", label: "Media" },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/subscriptions", label: "Subscriptions" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/forms", label: "Leads" },
  { to: "/admin/navigation", label: "Navigation" },
  { to: "/admin/settings", label: "Settings" },
];
</script>

<template>
  <div class="flex min-h-screen bg-slate-100">
    <aside class="w-56 shrink-0 border-r border-slate-200 bg-slate-900 text-slate-100">
      <div class="p-4 font-semibold">CMS</div>
      <nav class="flex flex-col gap-1 px-2 pb-8">
        <RouterLink
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          class="rounded-md px-3 py-2 text-sm hover:bg-slate-800"
          active-class="bg-slate-800 font-medium"
        >
          {{ item.label }}
        </RouterLink>
        <RouterLink to="/" class="mt-4 rounded-md px-3 py-2 text-sm text-slate-400 hover:bg-slate-800">
          View site
        </RouterLink>
      </nav>
    </aside>
    <div class="flex-1 overflow-auto">
      <div class="mx-auto max-w-6xl px-6 py-8">
        <RouterView />
      </div>
    </div>
  </div>
</template>

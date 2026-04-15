<script setup lang="ts">
import { RouterLink } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-slate-900">Welcome{{ auth.user?.name ? `, ${auth.user.name}` : "" }}</h1>
    <p class="mt-2 text-slate-600">Manage your profile, subscription, and orders from here.</p>
    <ul class="mt-8 grid gap-4 sm:grid-cols-2">
      <li>
        <RouterLink
          to="/account/profile"
          class="block rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:border-brand-300"
        >
          Profile settings
        </RouterLink>
      </li>
      <li>
        <RouterLink
          to="/members"
          class="block rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:border-brand-300"
        >
          Member library
        </RouterLink>
      </li>
    </ul>
  </div>
</template>

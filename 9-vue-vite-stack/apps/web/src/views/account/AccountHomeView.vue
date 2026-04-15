<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold text-white">Account</h1>
    <p class="mt-4 text-slate-400">
      Signed in as <strong class="text-white">{{ auth.me?.email }}</strong>
    </p>
    <ul class="mt-6 list-inside list-disc text-slate-300">
      <li v-for="r in auth.me?.roles ?? []" :key="r">{{ r }}</li>
    </ul>
  </div>
</template>

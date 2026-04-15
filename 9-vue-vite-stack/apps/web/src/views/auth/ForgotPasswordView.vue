<script setup lang="ts">
import { ref } from "vue";
import { RouterLink } from "vue-router";
import { api } from "@/lib/api";
import { useSeo } from "@/composables/useSeo";

useSeo({ title: "Forgot password", description: "Reset your password.", canonicalPath: "/forgot-password" });

const email = ref("");
const done = ref(false);

async function submit() {
  await api("/api/v1/auth/forgot-password", { method: "POST", json: { email: email.value } });
  done.value = true;
}
</script>

<template>
  <div class="mx-auto max-w-md px-4 py-16">
    <h1 class="text-2xl font-semibold text-white">Forgot password</h1>
    <p v-if="done" class="mt-6 text-slate-300">If an account exists, we sent a reset link.</p>
    <form v-else class="mt-8 space-y-4" @submit.prevent="submit">
      <div>
        <label class="block text-sm text-slate-300" for="email">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          required
          class="mt-1 w-full rounded-md border border-white/10 bg-brand-900 px-3 py-2 text-white"
        />
      </div>
      <button
        type="submit"
        class="w-full rounded-md bg-accent-500 py-2 text-sm font-semibold text-brand-950 hover:bg-accent-400"
      >
        Send reset link
      </button>
    </form>
    <p class="mt-6 text-center text-sm">
      <RouterLink class="text-accent-400 hover:underline" to="/login">Back to login</RouterLink>
    </p>
  </div>
</template>

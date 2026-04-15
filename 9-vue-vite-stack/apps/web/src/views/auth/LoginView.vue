<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useSeo } from "@/composables/useSeo";

useSeo({ title: "Log in", description: "Sign in to your account.", canonicalPath: "/login" });

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();
const email = ref("");
const password = ref("");
const error = ref<string | null>(null);

async function submit() {
  error.value = null;
  try {
    await auth.login(email.value, password.value);
    const next = typeof route.query.next === "string" ? route.query.next : "/account";
    await router.push(next);
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Login failed";
  }
}
</script>

<template>
  <div class="mx-auto max-w-md px-4 py-16">
    <h1 class="text-2xl font-semibold text-white">Log in</h1>
    <form class="mt-8 space-y-4" @submit.prevent="submit">
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
      <div>
        <label class="block text-sm text-slate-300" for="password">Password</label>
        <input
          id="password"
          v-model="password"
          type="password"
          required
          class="mt-1 w-full rounded-md border border-white/10 bg-brand-900 px-3 py-2 text-white"
        />
      </div>
      <p v-if="error" class="text-sm text-red-400">{{ error }}</p>
      <button
        type="submit"
        class="w-full rounded-md bg-accent-500 py-2 text-sm font-semibold text-brand-950 hover:bg-accent-400"
      >
        Sign in
      </button>
    </form>
    <p class="mt-6 text-center text-sm text-slate-400">
      <RouterLink class="text-accent-400 hover:underline" to="/forgot-password">Forgot password?</RouterLink>
      ·
      <RouterLink class="text-accent-400 hover:underline" to="/register">Create account</RouterLink>
    </p>
  </div>
</template>

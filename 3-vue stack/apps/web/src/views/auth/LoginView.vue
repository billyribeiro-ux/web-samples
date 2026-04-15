<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const email = ref("");
const password = ref("");
const err = ref("");
const auth = useAuthStore();
const route = useRoute();
const router = useRouter();

async function submit() {
  err.value = "";
  try {
    await auth.login(email.value, password.value);
    const r = typeof route.query.redirect === "string" ? route.query.redirect : "/account";
    await router.push(r);
  } catch (e) {
    err.value = e instanceof Error ? e.message : "Login failed";
  }
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-slate-900">Log in</h1>
    <form class="mt-6 space-y-4" @submit.prevent="submit">
      <div>
        <label class="block text-sm font-medium text-slate-700" for="email">Email</label>
        <input id="email" v-model="email" type="email" required class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-700" for="password">Password</label>
        <input id="password" v-model="password" type="password" required class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
      </div>
      <button type="submit" class="w-full rounded-md bg-brand-600 py-2 font-semibold text-white hover:bg-brand-700">
        Sign in
      </button>
      <p v-if="err" class="text-sm text-red-600">{{ err }}</p>
    </form>
    <p class="mt-4 text-center text-sm text-slate-600">
      <RouterLink to="/forgot-password" class="text-brand-600 hover:underline">Forgot password?</RouterLink>
    </p>
    <p class="mt-2 text-center text-sm text-slate-600">
      No account?
      <RouterLink to="/register" class="font-medium text-brand-600 hover:underline">Create one</RouterLink>
    </p>
  </div>
</template>

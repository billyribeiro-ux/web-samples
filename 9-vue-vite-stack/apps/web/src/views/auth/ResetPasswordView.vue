<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import { api } from "@/lib/api";
import { useSeo } from "@/composables/useSeo";

useSeo({ title: "Reset password", description: "Choose a new password.", canonicalPath: "/reset-password" });

const route = useRoute();
const router = useRouter();
const token = ref("");
const password = ref("");
const done = ref(false);

onMounted(() => {
  const t = route.query.token;
  token.value = typeof t === "string" ? t : "";
});

async function submit() {
  await api("/api/v1/auth/reset-password", {
    method: "POST",
    json: { token: token.value, password: password.value },
  });
  done.value = true;
  setTimeout(() => router.push("/login"), 1500);
}
</script>

<template>
  <div class="mx-auto max-w-md px-4 py-16">
    <h1 class="text-2xl font-semibold text-white">Reset password</h1>
    <p v-if="done" class="mt-6 text-emerald-400">Password updated. Redirecting…</p>
    <form v-else class="mt-8 space-y-4" @submit.prevent="submit">
      <div>
        <label class="block text-sm text-slate-300" for="password">New password</label>
        <input
          id="password"
          v-model="password"
          type="password"
          required
          minlength="8"
          class="mt-1 w-full rounded-md border border-white/10 bg-brand-900 px-3 py-2 text-white"
        />
      </div>
      <button
        type="submit"
        class="w-full rounded-md bg-accent-500 py-2 text-sm font-semibold text-brand-950 hover:bg-accent-400"
      >
        Update password
      </button>
    </form>
    <p class="mt-6 text-center text-sm">
      <RouterLink class="text-accent-400 hover:underline" to="/login">Login</RouterLink>
    </p>
  </div>
</template>

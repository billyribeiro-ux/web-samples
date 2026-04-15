<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { apiFetch } from "@/lib/api";

const route = useRoute();
const router = useRouter();
const password = ref("");
const err = ref("");

async function submit() {
  err.value = "";
  const token = typeof route.query.token === "string" ? route.query.token : "";
  const res = await apiFetch("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, password: password.value }),
  });
  if (!res.ok) {
    err.value = "Invalid or expired token";
    return;
  }
  await router.push("/login");
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-slate-900">Set new password</h1>
    <form class="mt-6 space-y-4" @submit.prevent="submit">
      <div>
        <label class="block text-sm font-medium text-slate-700" for="password">New password</label>
        <input id="password" v-model="password" type="password" required minlength="8" class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
      </div>
      <button type="submit" class="w-full rounded-md bg-brand-600 py-2 font-semibold text-white hover:bg-brand-700">
        Update password
      </button>
      <p v-if="err" class="text-sm text-red-600">{{ err }}</p>
    </form>
  </div>
</template>

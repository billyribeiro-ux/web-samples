<script setup lang="ts">
import { ref } from "vue";
import { apiFetch } from "@/lib/api";

const email = ref("");
const done = ref(false);

async function submit() {
  await apiFetch("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email: email.value }),
  });
  done.value = true;
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-slate-900">Reset password</h1>
    <p v-if="done" class="mt-4 text-slate-600">If an account exists, we sent a reset link.</p>
    <form v-else class="mt-6 space-y-4" @submit.prevent="submit">
      <div>
        <label class="block text-sm font-medium text-slate-700" for="email">Email</label>
        <input id="email" v-model="email" type="email" required class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
      </div>
      <button type="submit" class="w-full rounded-md bg-brand-600 py-2 font-semibold text-white hover:bg-brand-700">
        Send link
      </button>
    </form>
  </div>
</template>

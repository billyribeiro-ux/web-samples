<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute, RouterLink } from "vue-router";
import { api } from "@/lib/api";
import { useSeo } from "@/composables/useSeo";

useSeo({ title: "Verify email", description: "Confirm your email address.", canonicalPath: "/verify-email" });

const route = useRoute();
const status = ref<"idle" | "ok" | "err">("idle");

onMounted(async () => {
  const t = route.query.token;
  const token = typeof t === "string" ? t : "";
  if (!token) {
    status.value = "err";
    return;
  }
  try {
    await api("/api/v1/auth/verify-email", { method: "POST", json: { token } });
    status.value = "ok";
  } catch {
    status.value = "err";
  }
});
</script>

<template>
  <div class="mx-auto max-w-md px-4 py-16 text-center">
    <h1 class="text-2xl font-semibold text-white">Email verification</h1>
    <p v-if="status === 'ok'" class="mt-6 text-emerald-400">Your email is verified.</p>
    <p v-else-if="status === 'err'" class="mt-6 text-red-400">Invalid or missing token.</p>
    <RouterLink class="mt-8 inline-block text-accent-400 hover:underline" to="/login">Log in</RouterLink>
  </div>
</template>

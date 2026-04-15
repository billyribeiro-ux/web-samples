<script setup lang="ts">
import { onMounted, ref } from "vue";
import { profileUpdateSchema, changePasswordSchema } from "@platform/shared";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();
const name = ref("");
const currentPassword = ref("");
const newPassword = ref("");
const msg = ref("");

onMounted(() => {
  name.value = auth.user?.name ?? "";
});

async function saveProfile() {
  msg.value = "";
  const parsed = profileUpdateSchema.safeParse({ name: name.value || null });
  if (!parsed.success) {
    msg.value = "Invalid name";
    return;
  }
  await apiFetch("/auth/profile", { method: "PATCH", body: JSON.stringify(parsed.data) });
  await auth.fetchMe();
  msg.value = "Saved.";
}

async function savePassword() {
  msg.value = "";
  const parsed = changePasswordSchema.safeParse({
    currentPassword: currentPassword.value,
    newPassword: newPassword.value,
  });
  if (!parsed.success) {
    msg.value = "Check password fields";
    return;
  }
  await apiFetch("/auth/change-password", { method: "POST", body: JSON.stringify(parsed.data) });
  currentPassword.value = "";
  newPassword.value = "";
  msg.value = "Password updated.";
}
</script>

<template>
  <div class="max-w-lg space-y-10">
    <div>
      <h1 class="text-2xl font-bold text-slate-900">Profile</h1>
      <form class="mt-6 space-y-4" @submit.prevent="saveProfile">
        <div>
          <label class="block text-sm font-medium text-slate-700" for="name">Name</label>
          <input id="name" v-model="name" type="text" class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
        </div>
        <button type="submit" class="rounded-md bg-brand-600 px-4 py-2 text-white">Save</button>
      </form>
    </div>
    <div>
      <h2 class="text-lg font-semibold text-slate-900">Change password</h2>
      <form class="mt-4 space-y-4" @submit.prevent="savePassword">
        <div>
          <label class="block text-sm font-medium" for="cur">Current password</label>
          <input id="cur" v-model="currentPassword" type="password" class="mt-1 w-full rounded-md border px-3 py-2" />
        </div>
        <div>
          <label class="block text-sm font-medium" for="newp">New password</label>
          <input id="newp" v-model="newPassword" type="password" class="mt-1 w-full rounded-md border px-3 py-2" />
        </div>
        <button type="submit" class="rounded-md bg-slate-900 px-4 py-2 text-white">Update password</button>
      </form>
    </div>
    <p v-if="msg" class="text-sm text-slate-600">{{ msg }}</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();
const name = ref("");
const saved = ref(false);

onMounted(() => {
  name.value = auth.me?.name ?? "";
});

async function save() {
  saved.value = false;
  await api("/api/v1/me/profile", {
    method: "PUT",
    headers: auth.headersForWrite(),
    json: { name: name.value || null },
  });
  await auth.refreshMe();
  saved.value = true;
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold text-white">Profile</h1>
    <form class="mt-8 max-w-md space-y-4" @submit.prevent="save">
      <div>
        <label class="block text-sm text-slate-300" for="name">Name</label>
        <input
          id="name"
          v-model="name"
          class="mt-1 w-full rounded-md border border-white/10 bg-brand-900 px-3 py-2 text-white"
        />
      </div>
      <button
        type="submit"
        class="rounded-md bg-accent-500 px-4 py-2 text-sm font-semibold text-brand-950 hover:bg-accent-400"
      >
        Save
      </button>
      <p v-if="saved" class="text-sm text-emerald-400">Saved.</p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter, RouterLink } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const name = ref("");
const email = ref("");
const password = ref("");
const err = ref("");
const done = ref(false);
const auth = useAuthStore();
const router = useRouter();

async function submit() {
  err.value = "";
  try {
    await auth.register({ email: email.value, password: password.value, name: name.value || undefined });
    done.value = true;
    await router.push("/login");
  } catch (e) {
    err.value = e instanceof Error ? e.message : "Registration failed";
  }
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-slate-900">Create account</h1>
    <p v-if="done" class="mt-4 text-green-700">Account created. Check your email to verify, then log in.</p>
    <form v-else class="mt-6 space-y-4" @submit.prevent="submit">
      <div>
        <label class="block text-sm font-medium text-slate-700" for="name">Name</label>
        <input id="name" v-model="name" type="text" class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-700" for="email">Email</label>
        <input id="email" v-model="email" type="email" required class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-700" for="password">Password</label>
        <input id="password" v-model="password" type="password" required minlength="8" class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
      </div>
      <button type="submit" class="w-full rounded-md bg-brand-600 py-2 font-semibold text-white hover:bg-brand-700">
        Register
      </button>
      <p v-if="err" class="text-sm text-red-600">{{ err }}</p>
    </form>
    <p class="mt-4 text-center text-sm text-slate-600">
      Already have an account?
      <RouterLink to="/login" class="font-medium text-brand-600 hover:underline">Log in</RouterLink>
    </p>
  </div>
</template>

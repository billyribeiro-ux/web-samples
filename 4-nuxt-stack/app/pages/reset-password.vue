<script setup lang="ts">
definePageMeta({ layout: 'auth' })
const route = useRoute()
const token = computed(() => (typeof route.query.token === 'string' ? route.query.token : ''))
const password = ref('')
const ok = ref(false)

async function submit() {
  await $fetch('/api/auth/reset-password', {
    method: 'POST',
    body: { token: token.value, password: password.value },
  })
  ok.value = true
}

useSeo({ title: 'Set new password' })
</script>

<template>
  <div class="rounded-2xl border border-slate-800 p-8 bg-slate-900/50">
    <h1 class="text-2xl font-semibold text-white text-center">New password</h1>
    <form v-if="!ok && token" class="mt-6 space-y-4" @submit.prevent="submit">
      <div>
        <label for="password" class="block text-sm text-slate-400">Password</label>
        <input id="password" v-model="password" type="password" required minlength="8" class="mt-1 w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2" />
      </div>
      <button type="submit" class="w-full py-2 rounded-lg bg-emerald-500 text-slate-950 font-semibold">Update</button>
    </form>
    <p v-else-if="!token" class="mt-6 text-red-400 text-sm text-center">Invalid link.</p>
    <p v-else class="mt-6 text-center text-emerald-400 text-sm">Password updated. <NuxtLink to="/login" class="underline">Sign in</NuxtLink></p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })
const route = useRoute()
const email = ref('')
const password = ref('')
const error = ref('')
const { refresh } = useAuth()

async function submit() {
  error.value = ''
  try {
    await $fetch('/api/auth/login', { method: 'POST', body: { email: email.value, password: password.value } })
    await refresh()
    const r = typeof route.query.redirect === 'string' ? route.query.redirect : '/account'
    await navigateTo(r)
  } catch {
    error.value = 'Invalid credentials'
  }
}

useSeo({ title: 'Sign in' })
</script>

<template>
  <div class="rounded-2xl border border-slate-800 p-8 bg-slate-900/50">
    <h1 class="text-2xl font-semibold text-white text-center">Sign in</h1>
    <form class="mt-6 space-y-4" @submit.prevent="submit">
      <div>
        <label for="email" class="block text-sm text-slate-400">Email</label>
        <input id="email" v-model="email" type="email" required class="mt-1 w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2" />
      </div>
      <div>
        <label for="password" class="block text-sm text-slate-400">Password</label>
        <input id="password" v-model="password" type="password" required class="mt-1 w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2" />
      </div>
      <p v-if="error" class="text-red-400 text-sm">{{ error }}</p>
      <button type="submit" class="w-full py-2 rounded-lg bg-emerald-500 text-slate-950 font-semibold">Sign in</button>
    </form>
    <p class="mt-4 text-center text-sm text-slate-500">
      <NuxtLink to="/forgot-password" class="text-emerald-400">Forgot password</NuxtLink>
      ·
      <NuxtLink to="/register" class="text-emerald-400">Create account</NuxtLink>
    </p>
  </div>
</template>

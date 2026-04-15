<script setup lang="ts">
definePageMeta({ layout: 'auth' })
const email = ref('')
const ok = ref(false)

async function submit() {
  await $fetch('/api/auth/forgot-password', { method: 'POST', body: { email: email.value } })
  ok.value = true
}

useSeo({ title: 'Forgot password' })
</script>

<template>
  <div class="rounded-2xl border border-slate-800 p-8 bg-slate-900/50">
    <h1 class="text-2xl font-semibold text-white text-center">Reset password</h1>
    <form v-if="!ok" class="mt-6 space-y-4" @submit.prevent="submit">
      <div>
        <label for="email" class="block text-sm text-slate-400">Email</label>
        <input id="email" v-model="email" type="email" required class="mt-1 w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2" />
      </div>
      <button type="submit" class="w-full py-2 rounded-lg bg-emerald-500 text-slate-950 font-semibold">Send link</button>
    </form>
    <p v-else class="mt-6 text-center text-slate-400 text-sm">If an account exists, we sent reset instructions.</p>
  </div>
</template>

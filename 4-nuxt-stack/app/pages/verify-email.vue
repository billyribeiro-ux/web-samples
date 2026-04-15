<script setup lang="ts">
definePageMeta({ layout: 'auth' })
const route = useRoute()
const token = computed(() => (typeof route.query.token === 'string' ? route.query.token : ''))
const status = ref<'idle' | 'ok' | 'err'>('idle')

onMounted(async () => {
  if (!token.value) {
    status.value = 'err'
    return
  }
  try {
    await $fetch('/api/auth/verify-email', { method: 'POST', body: { token: token.value } })
    status.value = 'ok'
  } catch {
    status.value = 'err'
  }
})

useSeo({ title: 'Verify email' })
</script>

<template>
  <div class="rounded-2xl border border-slate-800 p-8 bg-slate-900/50 text-center">
    <p v-if="status === 'idle'" class="text-slate-400">Verifying…</p>
    <p v-else-if="status === 'ok'" class="text-emerald-400">Email verified. <NuxtLink to="/account" class="underline">Continue</NuxtLink></p>
    <p v-else class="text-red-400">Verification failed.</p>
  </div>
</template>

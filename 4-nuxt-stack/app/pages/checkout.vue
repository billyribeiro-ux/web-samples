<script setup lang="ts">
const cart = useCartStore()
const { user } = useAuth()
const email = ref(user.value?.email ?? '')
const error = ref('')
const loading = ref(false)

useSeo({ title: 'Checkout' })

async function pay() {
  if (!cart.lines.length) return
  loading.value = true
  error.value = ''
  try {
    const { url } = await $fetch<{ url: string | null }>('/api/checkout/create', {
      method: 'POST',
      body: {
        items: cart.lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
        email: email.value || undefined,
      },
    })
    if (url) {
      cart.clear()
      navigateTo(url, { external: true })
    }
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Checkout failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-lg mx-auto px-4 py-16">
    <h1 class="text-3xl font-semibold text-white">Checkout</h1>
    <p class="mt-4 text-slate-400 text-sm">Secure payment via Stripe Checkout.</p>
    <div v-if="!user" class="mt-6">
      <label for="email" class="block text-sm text-slate-400">Email</label>
      <input
        id="email"
        v-model="email"
        type="email"
        required
        class="mt-1 w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2"
      />
    </div>
    <p v-if="error" class="mt-4 text-red-400 text-sm">{{ error }}</p>
    <button
      type="button"
      class="mt-8 w-full py-3 rounded-lg bg-emerald-500 text-slate-950 font-semibold disabled:opacity-50"
      :disabled="loading || !cart.lines.length"
      @click="pay"
    >
      {{ loading ? 'Redirecting…' : 'Pay with Stripe' }}
    </button>
  </div>
</template>

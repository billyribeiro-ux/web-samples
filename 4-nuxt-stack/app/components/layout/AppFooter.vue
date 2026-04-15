<script setup lang="ts">
const { data: nav } = await useFetch('/api/site/navigation')
const config = useRuntimeConfig()
const email = ref('')
const msg = ref('')

const footerFallback = [
  { id: 'ff-p', label: 'Privacy', href: '/privacy-policy' },
  { id: 'ff-t', label: 'Terms', href: '/terms' },
  { id: 'ff-c', label: 'Cookies', href: '/cookies' },
]

const footerItems = computed(() => {
  const items = nav.value?.footer?.items
  return items?.length ? items : footerFallback
})

async function onNewsletter() {
  await $fetch('/api/forms/newsletter', {
    method: 'POST',
    body: { email: email.value, hp: '' },
  })
  msg.value = 'Thanks — you are on the list.'
  email.value = ''
}
</script>

<template>
  <footer class="border-t border-slate-800 mt-20">
    <div class="max-w-6xl mx-auto px-4 py-12 grid gap-8 md:grid-cols-3">
      <div>
        <p class="font-semibold text-white">{{ config.public.siteName }}</p>
        <p class="text-sm text-slate-400 mt-2">Built with Nuxt, Prisma, and Stripe.</p>
      </div>
      <nav aria-label="Footer">
        <ul class="space-y-2 text-sm">
          <li v-for="item in footerItems" :key="item.id">
            <NuxtLink :to="item.href" class="text-slate-400 hover:text-white">
              {{ item.label }}
            </NuxtLink>
          </li>
        </ul>
      </nav>
      <div>
        <p class="text-sm font-medium text-slate-300">Newsletter</p>
        <form class="mt-2 flex gap-2" @submit.prevent="onNewsletter">
          <label class="sr-only" for="nl-email">Email</label>
          <input
            id="nl-email"
            v-model="email"
            type="email"
            required
            class="flex-1 rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
            placeholder="you@company.com"
            autocomplete="email"
          />
          <button
            type="submit"
            class="px-3 py-2 rounded-md bg-emerald-500 text-slate-950 text-sm font-medium"
          >
            Join
          </button>
        </form>
        <p v-if="msg" class="text-xs text-emerald-400 mt-2">{{ msg }}</p>
      </div>
    </div>
  </footer>
</template>

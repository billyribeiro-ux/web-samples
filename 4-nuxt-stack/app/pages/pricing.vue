<script setup lang="ts">
import type { PlansApiResponse } from '~/types/plan'

const { user } = useAuth()

const { data: plansPayload, error: plansError } = await useAsyncData('plans', () =>
  $fetch<PlansApiResponse>('/api/plans'),
)

useSeo({ title: 'Pricing', description: 'Simple plans with monthly and yearly billing.' })

const subscribeError = ref('')
const busySlug = ref<string | null>(null)
const busyInterval = ref<'month' | 'year' | null>(null)

const planItems = computed(() => plansPayload.value?.items ?? [])

async function onSubscribe(slug: string, interval: 'month' | 'year') {
  subscribeError.value = ''
  if (!user.value) {
    await navigateTo({ path: '/login', query: { redirect: '/pricing' } })
    return
  }
  busySlug.value = slug
  busyInterval.value = interval
  try {
    const res = await $fetch<{ url: string | null }>('/api/billing/subscribe', {
      method: 'POST',
      body: { planSlug: slug, interval },
    })
    if (res.url) {
      await navigateTo(res.url, { external: true })
    } else {
      subscribeError.value = 'No checkout URL returned.'
    }
  } catch (e: unknown) {
    const err = e as { statusCode?: number; statusMessage?: string; data?: { message?: string } }
    if (err.statusCode === 503) {
      subscribeError.value =
        'Billing is not fully configured: add Stripe price IDs to each plan (database or seed env vars).'
    } else if (err.statusCode === 404) {
      subscribeError.value =
        'Plan not found in the database. Run `npx prisma migrate deploy` and `npx prisma db seed`.'
    } else if (err.statusCode === 401) {
      await navigateTo({ path: '/login', query: { redirect: '/pricing' } })
    } else {
      subscribeError.value = err.data?.message || err.statusMessage || 'Checkout could not start.'
    }
  } finally {
    busySlug.value = null
    busyInterval.value = null
  }
}
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 py-16">
    <h1 class="text-3xl font-semibold text-white text-center">Pricing</h1>
    <p class="mt-3 text-center text-slate-400 max-w-xl mx-auto text-sm">
      Transparent monthly or yearly billing. Subscriptions use Stripe Checkout (test mode when using test keys).
    </p>

    <div
      v-if="plansPayload?.source === 'fallback'"
      class="mt-8 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100 text-center"
      role="status"
    >
      Showing demo plans — your database has no plans yet. Run
      <code class="text-emerald-300">npx prisma db seed</code>
      so checkout can resolve real plan rows.
    </div>

    <div
      v-if="plansError"
      class="mt-8 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200 text-center"
    >
      Could not load plans. Check the database connection and try again.
    </div>

    <p v-if="subscribeError" class="mt-6 text-center text-sm text-red-400">{{ subscribeError }}</p>

    <div class="mt-12">
      <PricingCards
        v-if="planItems.length"
        variant="full"
        :plans="planItems"
        :busy-slug="busySlug"
        :busy-interval="busyInterval"
        @subscribe="onSubscribe"
      />
      <p v-else-if="!plansError" class="text-center text-slate-500 text-sm">No plans available.</p>
    </div>

    <p class="mt-10 text-center text-xs text-slate-500">
      <NuxtLink to="/register" class="text-emerald-400 hover:underline">Create an account</NuxtLink>
      to subscribe, or
      <NuxtLink to="/login" class="text-emerald-400 hover:underline">sign in</NuxtLink>
      if you already have one.
    </p>
  </div>
</template>

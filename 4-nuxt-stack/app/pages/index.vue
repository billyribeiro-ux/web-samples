<script setup lang="ts">
import type { PlansApiResponse } from '~/types/plan'

const config = useRuntimeConfig()
useSeo({
  title: `${config.public.siteName} — Modern business platform`,
  description: 'Marketing, memberships, commerce, and content in one premium experience.',
})

const { data: brand } = await useAsyncData('site-brand', async () => {
  try {
    return await $fetch<{ value: Record<string, string> }>('/api/site/setting/brand')
  } catch {
    return { value: {} }
  }
})

const { data: plansPayload } = await useAsyncData('plans', () => $fetch<PlansApiResponse>('/api/plans'))
</script>

<template>
  <div>
    <section class="relative overflow-hidden border-b border-slate-800">
      <div class="max-w-6xl mx-auto px-4 py-24 md:py-32">
        <p class="text-emerald-400 text-sm font-medium tracking-wide uppercase">Digital operations</p>
        <h1 class="mt-4 text-4xl md:text-6xl font-semibold text-white max-w-3xl leading-tight">
          {{ brand?.value?.tagline || 'Launch a credible, conversion-ready platform.' }}
        </h1>
        <p class="mt-6 text-lg text-slate-400 max-w-2xl">
          Memberships, subscriptions, ecommerce, and SEO content — engineered for real businesses, not demos.
        </p>
        <div class="mt-10 flex flex-wrap gap-4">
          <NuxtLink
            :to="brand?.value?.ctaHref || '/contact'"
            class="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-emerald-500 text-slate-950 font-semibold hover:bg-emerald-400"
          >
            {{ brand?.value?.ctaLabel || 'Book a demo' }}
          </NuxtLink>
          <NuxtLink
            to="/products"
            class="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-emerald-500/50 text-emerald-400 font-medium hover:bg-emerald-500/10"
          >
            Shop products
          </NuxtLink>
          <NuxtLink
            to="/pricing"
            class="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-slate-700 hover:border-slate-500"
          >
            View pricing
          </NuxtLink>
        </div>
      </div>
    </section>
    <section class="max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-3 gap-8">
      <div class="rounded-xl border border-slate-800 p-6 bg-slate-900/40">
        <h2 class="text-lg font-semibold text-white">SEO-first content</h2>
        <p class="mt-2 text-slate-400 text-sm">Blog engine with metadata, feeds, and structured data hooks.</p>
      </div>
      <NuxtLink
        to="/products"
        class="rounded-xl border border-slate-800 p-6 bg-slate-900/40 block hover:border-emerald-500/40 transition"
      >
        <h2 class="text-lg font-semibold text-white">Commerce ready</h2>
        <p class="mt-2 text-slate-400 text-sm">Cart, checkout, and Stripe webhooks wired to orders.</p>
        <span class="mt-4 inline-block text-sm text-emerald-400">Open store →</span>
      </NuxtLink>
      <div class="rounded-xl border border-slate-800 p-6 bg-slate-900/40">
        <h2 class="text-lg font-semibold text-white">Headless CMS</h2>
        <p class="mt-2 text-slate-400 text-sm">Role-based admin for posts, products, and leads.</p>
      </div>
    </section>

    <section v-if="(plansPayload?.items ?? []).length" class="border-t border-slate-800 bg-slate-950/60">
      <div class="max-w-5xl mx-auto px-4 py-16 md:py-20">
        <h2 class="text-2xl md:text-3xl font-semibold text-white text-center">Membership pricing</h2>
        <p class="mt-3 text-center text-slate-400 text-sm max-w-xl mx-auto">
          Monthly or yearly plans with Stripe Checkout. Open the pricing page to subscribe (account required).
        </p>
        <div class="mt-10">
          <PricingCards variant="compact" :plans="plansPayload?.items ?? []" />
        </div>
      </div>
    </section>
  </div>
</template>

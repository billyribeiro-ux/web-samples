<script setup lang="ts">
import type { PlanCardModel } from '~/types/plan'

const props = withDefaults(
  defineProps<{
    plans: PlanCardModel[]
    variant?: 'full' | 'compact'
    busySlug?: string | null
    busyInterval?: 'month' | 'year' | null
  }>(),
  { variant: 'full', busySlug: null, busyInterval: null },
)

const emit = defineEmits<{
  subscribe: [slug: string, interval: 'month' | 'year']
}>()

function featureLines(features: unknown): string[] {
  if (Array.isArray(features)) {
    return features.filter((x): x is string => typeof x === 'string')
  }
  return []
}

function formatMoney(cents: number) {
  return (cents / 100).toFixed(0)
}

function yearlyMonthlyEquivalent(yearlyCents: number) {
  return Math.round(yearlyCents / 12) / 100
}

function canCheckout(p: PlanCardModel, interval: 'month' | 'year') {
  const id = interval === 'year' ? p.stripePriceYearlyId : p.stripePriceMonthlyId
  return !!id
}

function isBusy(p: PlanCardModel, interval: 'month' | 'year') {
  return props.busySlug === p.slug && props.busyInterval === interval
}
</script>

<template>
  <div
    class="grid gap-6"
    :class="variant === 'compact' ? 'md:grid-cols-2' : 'md:grid-cols-2'"
  >
    <div
      v-for="p in plans"
      :id="`plan-${p.slug}`"
      :key="p.id"
      class="rounded-2xl border p-6 flex flex-col"
      :class="p.highlighted ? 'border-emerald-500 bg-emerald-500/5' : 'border-slate-800 bg-slate-900/30'"
    >
      <div v-if="p.highlighted" class="text-xs font-medium text-emerald-400 uppercase tracking-wide">
        Popular
      </div>
      <h2 class="text-xl font-semibold text-white mt-1">{{ p.name }}</h2>
      <p class="mt-2 text-slate-400 text-sm min-h-[2.5rem]">{{ p.description }}</p>

      <ul v-if="featureLines(p.features).length" class="mt-4 space-y-2 text-sm text-slate-300">
        <li v-for="(line, i) in featureLines(p.features)" :key="i" class="flex gap-2">
          <span class="text-emerald-500 shrink-0" aria-hidden="true">✓</span>
          <span>{{ line }}</span>
        </li>
      </ul>

      <div class="mt-6 space-y-1">
        <p class="text-3xl font-bold text-white">
          ${{ formatMoney(p.priceMonthlyCents) }}
          <span class="text-base font-normal text-slate-500">/mo</span>
        </p>
        <p class="text-sm text-slate-500">
          or ${{ formatMoney(p.priceYearlyCents) }}/yr
          <span class="text-slate-600"> (~${{ yearlyMonthlyEquivalent(p.priceYearlyCents).toFixed(0) }}/mo) </span>
        </p>
      </div>

      <div class="mt-auto pt-6 space-y-2">
        <template v-if="variant === 'full'">
          <button
            type="button"
            class="w-full py-2.5 rounded-lg bg-emerald-500 text-slate-950 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!canCheckout(p, 'month') || busySlug === p.slug"
            @click="emit('subscribe', p.slug, 'month')"
          >
            <span v-if="isBusy(p, 'month')">Starting…</span>
            <span v-else>Start monthly</span>
          </button>
          <button
            type="button"
            class="w-full py-2.5 rounded-lg border border-slate-700 text-slate-200 hover:border-slate-500 disabled:opacity-50"
            :disabled="!canCheckout(p, 'year') || busySlug === p.slug"
            @click="emit('subscribe', p.slug, 'year')"
          >
            <span v-if="isBusy(p, 'year')">Starting…</span>
            <span v-else>Bill yearly</span>
          </button>
          <p
            v-if="!canCheckout(p, 'month') && !canCheckout(p, 'year')"
            class="text-xs text-amber-400/90 text-center"
          >
            Stripe price IDs not set for this plan (configure in DB or env — see README).
          </p>
        </template>
        <NuxtLink
          v-else
          to="/pricing"
          class="block w-full py-2.5 rounded-lg text-center bg-emerald-500/15 text-emerald-400 font-medium border border-emerald-500/30 hover:bg-emerald-500/25"
        >
          View plan & subscribe
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

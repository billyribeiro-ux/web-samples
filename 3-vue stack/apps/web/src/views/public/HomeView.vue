<script setup lang="ts">
import { RouterLink } from "vue-router";
import { ref } from "vue";
import { useSeo, jsonLdOrganization } from "@/composables/useSeo";
import { useHead } from "@unhead/vue";

useSeo({ title: "Ship a credible digital business", description: "Marketing, content, commerce, and memberships in one stack." });
useHead({
  script: [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify(jsonLdOrganization()),
    },
  ],
});

const email = ref("");
</script>

<template>
  <section class="border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
    <div class="mx-auto max-w-6xl px-4 py-20 md:flex md:items-center md:gap-12">
      <div class="flex-1">
        <p class="text-sm font-semibold uppercase tracking-wide text-brand-600">Modern business platform</p>
        <h1 class="mt-3 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
          Launch faster. Convert with confidence.
        </h1>
        <p class="mt-4 max-w-xl text-lg text-slate-600">
          Premium public site, SEO blog, store, memberships, and a real admin — backed by PostgreSQL and Stripe-ready
          architecture.
        </p>
        <div class="mt-8 flex flex-wrap gap-4">
          <RouterLink
            to="/register"
            class="inline-flex items-center justify-center rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
          >
            Start free
          </RouterLink>
          <RouterLink
            to="/pricing"
            class="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            View pricing
          </RouterLink>
        </div>
      </div>
      <div class="mt-10 flex-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg md:mt-0">
        <p class="text-sm font-medium text-slate-900">Stay in the loop</p>
        <form class="mt-4 flex gap-2" @submit.prevent>
          <label class="sr-only" for="hero-email">Email</label>
          <input
            id="hero-email"
            v-model="email"
            type="email"
            autocomplete="email"
            placeholder="you@company.com"
            class="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          <RouterLink
            to="/contact"
            class="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Talk to us
          </RouterLink>
        </form>
        <p class="mt-3 text-xs text-slate-500">No spam. Unsubscribe anytime.</p>
      </div>
    </div>
  </section>
  <section class="mx-auto max-w-6xl px-4 py-16">
    <h2 class="text-center text-2xl font-bold text-slate-900">Built for serious operators</h2>
    <div class="mt-10 grid gap-6 md:grid-cols-3">
      <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 class="font-semibold text-slate-900">SEO-first content</h3>
        <p class="mt-2 text-sm text-slate-600">Posts, metadata, sitemap, and structured data hooks.</p>
      </div>
      <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 class="font-semibold text-slate-900">Commerce + subscriptions</h3>
        <p class="mt-2 text-sm text-slate-600">Stripe Checkout patterns with webhook-driven state.</p>
      </div>
      <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 class="font-semibold text-slate-900">Role-based admin</h3>
        <p class="mt-2 text-sm text-slate-600">Manage content, catalog, and leads in one place.</p>
      </div>
    </div>
  </section>
</template>

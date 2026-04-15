<script setup lang="ts">
import { onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { api } from "@/lib/api";
import { useSeo } from "@/composables/useSeo";

const homepage = ref<{
  hero?: { title?: string; subtitle?: string; primaryCta?: { label: string; href: string }; secondaryCta?: { label: string; href: string } };
} | null>(null);

useSeo({
  title: "Apex Platform — Modern business stack",
  description: "Marketing, memberships, blog, and commerce demo.",
  canonicalPath: "/",
});

onMounted(async () => {
  try {
    homepage.value = (await api("/api/v1/public/settings/homepage")) as typeof homepage.value;
  } catch {
    homepage.value = null;
  }
});
</script>

<template>
  <section class="border-b border-white/10 bg-gradient-to-b from-brand-900 to-brand-950">
    <div class="mx-auto max-w-6xl px-4 py-20 md:py-28">
      <p class="text-sm font-medium uppercase tracking-wide text-accent-400">Vue + Express + Prisma</p>
      <h1 class="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-white md:text-5xl">
        {{ homepage?.hero?.title ?? "Ship a serious digital business faster" }}
      </h1>
      <p class="mt-6 max-w-2xl text-lg text-slate-300">
        {{
          homepage?.hero?.subtitle ??
          "Premium marketing site, SEO blog, memberships, subscriptions, and a real admin CMS."
        }}
      </p>
      <div class="mt-10 flex flex-wrap gap-3">
        <RouterLink
          class="rounded-md bg-accent-500 px-5 py-3 text-sm font-semibold text-brand-950 hover:bg-accent-400"
          :to="homepage?.hero?.primaryCta?.href ?? '/pricing'"
        >
          {{ homepage?.hero?.primaryCta?.label ?? "View pricing" }}
        </RouterLink>
        <RouterLink
          class="rounded-md border border-white/20 px-5 py-3 text-sm font-semibold text-white hover:bg-white/5"
          :to="homepage?.hero?.secondaryCta?.href ?? '/blog'"
        >
          {{ homepage?.hero?.secondaryCta?.label ?? "Read the blog" }}
        </RouterLink>
      </div>
    </div>
  </section>
  <section class="mx-auto max-w-6xl px-4 py-16">
    <h2 class="text-xl font-semibold text-white">Built for conversion and operations</h2>
    <div class="mt-8 grid gap-6 md:grid-cols-3">
      <div class="rounded-xl border border-white/10 bg-brand-900/40 p-6">
        <h3 class="font-medium text-white">SEO content engine</h3>
        <p class="mt-2 text-sm text-slate-400">Posts, categories, tags, and PostgreSQL full-text search.</p>
      </div>
      <div class="rounded-xl border border-white/10 bg-brand-900/40 p-6">
        <h3 class="font-medium text-white">Commerce + billing</h3>
        <p class="mt-2 text-sm text-slate-400">Cart, Stripe Checkout, webhooks, and subscription paths.</p>
      </div>
      <div class="rounded-xl border border-white/10 bg-brand-900/40 p-6">
        <h3 class="font-medium text-white">Headless CMS</h3>
        <p class="mt-2 text-sm text-slate-400">Admin tables backed by real CRUD APIs and audit logs.</p>
      </div>
    </div>
  </section>
</template>

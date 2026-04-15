<script setup lang="ts">
const { data: nav } = await useFetch('/api/site/navigation')

const fallbackItems = [
  { id: 'fb-svc', label: 'Services', href: '/services' },
  { id: 'fb-pd', label: 'Products', href: '/products' },
  { id: 'fb-pr', label: 'Pricing', href: '/pricing' },
  { id: 'fb-bl', label: 'Blog', href: '/blog' },
  { id: 'fb-ct', label: 'Contact', href: '/contact' },
]

const cart = useCartStore()
const cartCount = computed(() => cart.count)

const headerItems = computed(() => {
  const items = nav.value?.header?.items
  const list = items?.length ? [...items] : [...fallbackItems]
  if (!list.some((i) => i.href === '/products')) {
    const afterServices = list.findIndex((i) => i.href === '/services')
    const insertAt = afterServices >= 0 ? afterServices + 1 : 0
    list.splice(insertAt, 0, {
      id: 'ensure-products',
      label: 'Products',
      href: '/products',
    })
  }
  return list
})

const { user, isLoggedIn, isAdmin } = useAuth()
const mobileOpen = ref(false)
</script>

<template>
  <header class="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-40">
    <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
      <div class="flex items-center gap-8">
        <NuxtLink to="/" class="font-semibold tracking-tight text-white"> Apex </NuxtLink>
        <nav class="hidden md:flex items-center gap-6 text-sm text-slate-300" aria-label="Primary">
          <NuxtLink
            v-for="item in headerItems"
            :key="item.id"
            :to="item.href"
            class="hover:text-white transition"
          >
            {{ item.label }}
          </NuxtLink>
        </nav>
      </div>
      <div class="flex items-center gap-3">
        <NuxtLink to="/search" class="text-sm text-slate-400 hover:text-white hidden sm:inline"> Search </NuxtLink>
        <NuxtLink
          to="/cart"
          class="inline-flex items-center gap-1.5 text-sm text-slate-300 hover:text-white"
        >
          <span>Cart</span>
          <span
            v-if="cartCount > 0"
            class="min-w-[1.25rem] rounded-full bg-emerald-500 px-1.5 py-0.5 text-center text-xs font-semibold text-slate-950"
            aria-label="Items in cart"
          >
            {{ cartCount }}
          </span>
        </NuxtLink>
        <NuxtLink
          v-if="isAdmin"
          to="/admin"
          class="text-sm text-emerald-400 hover:underline hidden sm:inline"
        >
          Admin
        </NuxtLink>
        <NuxtLink
          v-if="!isLoggedIn"
          to="/login"
          class="text-sm px-3 py-1.5 rounded-md bg-emerald-500 text-slate-950 font-medium hover:bg-emerald-400"
        >
          Sign in
        </NuxtLink>
        <NuxtLink
          v-else
          to="/account"
          class="text-sm px-3 py-1.5 rounded-md border border-slate-700 hover:border-slate-500"
        >
          {{ user?.name || user?.email }}
        </NuxtLink>
        <button
          type="button"
          class="md:hidden p-2 rounded-md border border-slate-700 text-slate-200"
          :aria-expanded="mobileOpen"
          aria-controls="mobile-nav"
          @click="mobileOpen = !mobileOpen"
        >
          Menu
        </button>
      </div>
    </div>
    <div
      v-show="mobileOpen"
      id="mobile-nav"
      class="md:hidden border-t border-slate-800 px-4 py-3 flex flex-col gap-2"
    >
      <NuxtLink
        v-for="item in headerItems"
        :key="item.id"
        :to="item.href"
        class="py-2"
        @click="mobileOpen = false"
      >
        {{ item.label }}
      </NuxtLink>
    </div>
  </header>
</template>

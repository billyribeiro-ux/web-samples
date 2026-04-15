<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const { user } = useAuth()
useSeo({ title: 'Account' })
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-16">
    <h1 class="text-3xl font-semibold text-white">Account</h1>
    <p class="mt-2 text-slate-400">Signed in as {{ user?.email }}</p>
    <ul class="mt-8 grid gap-3 sm:grid-cols-2">
      <li>
        <NuxtLink to="/account/profile" class="block rounded-lg border border-slate-800 p-4 hover:border-slate-600">
          Profile
        </NuxtLink>
      </li>
      <li>
        <NuxtLink
          to="/account/subscription"
          class="block rounded-lg border border-slate-800 p-4 hover:border-slate-600"
        >
          Subscription
        </NuxtLink>
      </li>
      <li>
        <NuxtLink to="/account/orders" class="block rounded-lg border border-slate-800 p-4 hover:border-slate-600">
          Orders
        </NuxtLink>
      </li>
      <li>
        <NuxtLink to="/account/favorites" class="block rounded-lg border border-slate-800 p-4 hover:border-slate-600">
          Favorites
        </NuxtLink>
      </li>
    </ul>
    <button
      type="button"
      class="mt-10 text-sm text-red-400 hover:underline"
      @click="$fetch('/api/auth/logout', { method: 'POST' }).then(() => navigateTo('/'))"
    >
      Sign out
    </button>
  </div>
</template>

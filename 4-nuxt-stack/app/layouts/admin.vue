<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 flex">
    <aside class="w-64 border-r border-slate-800 p-4 hidden md:block">
      <NuxtLink to="/admin" class="font-semibold text-emerald-400">CMS</NuxtLink>
      <nav class="mt-6 space-y-1 text-sm" aria-label="Admin">
        <NuxtLink class="block py-2 hover:text-white" to="/admin">Dashboard</NuxtLink>
        <NuxtLink class="block py-2 hover:text-white" to="/admin/posts">Posts</NuxtLink>
        <NuxtLink class="block py-2 hover:text-white" to="/admin/pages">Pages</NuxtLink>
        <NuxtLink class="block py-2 hover:text-white" to="/admin/products">Products</NuxtLink>
        <NuxtLink class="block py-2 hover:text-white" to="/admin/orders">Orders</NuxtLink>
        <NuxtLink class="block py-2 hover:text-white" to="/admin/users">Users</NuxtLink>
        <NuxtLink class="block py-2 hover:text-white" to="/admin/forms">Leads</NuxtLink>
        <NuxtLink class="block py-2 hover:text-white" to="/admin/pages">Pages</NuxtLink>
        <NuxtLink class="block py-2 hover:text-white" to="/admin/categories">Categories</NuxtLink>
        <NuxtLink class="block py-2 hover:text-white" to="/admin/tags">Tags</NuxtLink>
        <NuxtLink class="block py-2 hover:text-white" to="/admin/media">Media</NuxtLink>
        <NuxtLink class="block py-2 hover:text-white" to="/admin/users">Users</NuxtLink>
        <NuxtLink class="block py-2 hover:text-white" to="/admin/roles">Roles</NuxtLink>
        <NuxtLink class="block py-2 hover:text-white" to="/admin/subscriptions">Subscriptions</NuxtLink>
        <NuxtLink class="block py-2 hover:text-white" to="/admin/navigation">Navigation</NuxtLink>
        <NuxtLink class="block py-2 hover:text-white" to="/admin/settings">Settings</NuxtLink>
        <NuxtLink class="block py-2 hover:text-white" to="/admin/seo">SEO</NuxtLink>
      </nav>
    </aside>
    <div class="flex-1 flex flex-col">
      <header class="border-b border-slate-800 px-4 py-3 flex justify-between items-center">
        <span class="text-sm text-slate-400">Admin</span>
        <NuxtLink to="/" class="text-sm text-emerald-400 hover:underline">View site</NuxtLink>
      </header>
      <div class="p-6">
        <slot />
      </div>
    </div>
  </div>
</template>

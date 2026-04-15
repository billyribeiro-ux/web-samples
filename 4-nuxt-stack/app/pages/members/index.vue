<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'subscriber'] })
useSeo({ title: 'Member library' })
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-16">
    <h1 class="text-3xl font-semibold text-white">Member library</h1>
    <p class="mt-4 text-slate-400">
      Gated content area — requires Pro plan or admin access. Extend with downloadable assets from the CMS.
    </p>
  </div>
</template>

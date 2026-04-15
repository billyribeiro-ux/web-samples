<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold text-white">Media</h1>
    <p class="mt-4 text-slate-400 text-sm">Upload via <code class="text-emerald-400">POST /api/uploads/presign</code> then PUT to S3.</p>
  </div>
</template>

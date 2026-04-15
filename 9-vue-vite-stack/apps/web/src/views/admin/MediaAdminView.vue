<script setup lang="ts"></script>

<template>
  <div>
    <h1 class="text-2xl font-semibold text-slate-900">Media</h1>
    <p class="mt-4 text-sm text-slate-600">
      Use <code class="rounded bg-slate-100 px-1">POST /api/v1/admin/media/presign</code> then upload to S3,
      then <code class="rounded bg-slate-100 px-1">POST .../media/complete</code> when keys are configured.
    </p>
  </div>
</template>

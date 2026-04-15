<script setup lang="ts">
const props = defineProps<{ error: { statusCode?: number; statusMessage?: string } }>()
const handleError = () => clearError({ redirect: '/' })
</script>

<template>
  <div class="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 text-center">
    <p class="text-6xl font-bold text-slate-700">{{ props.error?.statusCode || 'Error' }}</p>
    <h1 class="mt-4 text-xl text-white">{{ props.error?.statusMessage || 'Something went wrong' }}</h1>
    <button
      type="button"
      class="mt-8 px-6 py-2 rounded-lg bg-emerald-500 text-slate-950 font-medium"
      @click="handleError"
    >
      Back home
    </button>
  </div>
</template>

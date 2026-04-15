<script setup lang="ts">
import { RouterView } from "vue-router";
import SiteHeader from "./SiteHeader.vue";
import SiteFooter from "./SiteFooter.vue";
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <a class="skip-link" href="#main">Skip to content</a>
    <SiteHeader />
    <main id="main" class="flex-1">
      <RouterView />
    </main>
    <SiteFooter />
  </div>
</template>

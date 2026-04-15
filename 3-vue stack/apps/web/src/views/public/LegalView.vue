<script setup lang="ts">
import { computed } from "vue";
import { useSeo } from "@/composables/useSeo";

const props = defineProps<{ pageKey: string }>();

const copy = computed(() => {
  switch (props.pageKey) {
    case "privacy":
      return {
        title: "Privacy Policy",
        body: "We process data to operate your account, deliver email, and improve the product. See our security page for details.",
      };
    case "terms":
      return {
        title: "Terms of Service",
        body: "By using this site you agree to these terms. Paid services are billed according to your selected plan.",
      };
    case "cookies":
      return {
        title: "Cookie Policy",
        body: "We use essential cookies for sessions and optional analytics cookies when configured.",
      };
    default:
      return { title: "Legal", body: "" };
  }
});

useSeo({
  title: copy.value.title,
  description: copy.value.title,
});
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-16">
    <h1 class="text-3xl font-bold text-slate-900">{{ copy.title }}</h1>
    <p class="mt-6 text-slate-600">{{ copy.body }}</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { apiJson } from "@/lib/api";

const props = defineProps<{ kind: "categories" | "tags" }>();

const items = ref<Record<string, unknown>[]>([]);

onMounted(async () => {
  const path = props.kind === "categories" ? "/taxonomy/categories" : "/taxonomy/tags";
  const res = await apiJson<{ items: Record<string, unknown>[] }>(path);
  items.value = res.items;
});
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold capitalize text-slate-900">{{ kind }}</h1>
    <ul class="mt-6 space-y-2">
      <li v-for="c in items" :key="String(c.id)" class="rounded border border-slate-200 bg-white px-4 py-2">
        {{ c.name }} <span class="text-slate-400">({{ c.slug }})</span>
      </li>
    </ul>
  </div>
</template>

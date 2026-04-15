<script setup lang="ts">
import { onMounted, ref } from "vue";
import { apiJson } from "@/lib/api";

const items = ref<{ id: string; entityType: string; entityId: string }[]>([]);

onMounted(async () => {
  const res = await apiJson<{ items: typeof items.value }>("/favorites");
  items.value = res.items;
});
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-slate-900">Favorites</h1>
    <ul class="mt-6 space-y-2">
      <li v-for="f in items" :key="f.id" class="text-slate-700">
        {{ f.entityType }} · {{ f.entityId }}
      </li>
    </ul>
    <p v-if="!items.length" class="mt-6 text-slate-600">No favorites saved.</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { apiJson } from "@/lib/api";

const state = ref<{ items: Record<string, unknown>[]; total: number }>({ items: [], total: 0 });

function formatRoles(u: Record<string, unknown>) {
  const roles = u.roles as { role: { slug: string } }[] | undefined;
  return roles?.map((r) => r.role.slug).join(", ") ?? "";
}

onMounted(async () => {
  const res = await apiJson<{ items: Record<string, unknown>[]; total: number }>("/admin/users");
  state.value = { items: res.items, total: res.total };
});
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-slate-900">Users</h1>
    <div class="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table class="min-w-full text-left text-sm">
        <thead class="bg-slate-50">
          <tr>
            <th class="px-4 py-2">Email</th>
            <th class="px-4 py-2">Roles</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in state.items" :key="String(u.id)" class="border-t border-slate-100">
            <td class="px-4 py-2">{{ u.email }}</td>
            <td class="px-4 py-2 text-xs">
              {{ formatRoles(u) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

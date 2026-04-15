<script setup lang="ts">
import { onMounted, ref } from "vue";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();
const users = ref<{ email: string; roles: { role: { name: string } }[] }[]>([]);

onMounted(async () => {
  users.value = await api("/api/v1/admin/users", { headers: auth.headersForWrite() });
});
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold text-slate-900">Users</h1>
    <table class="mt-8 w-full text-left text-sm">
      <thead>
        <tr class="border-b border-slate-200 text-slate-500">
          <th class="py-2">Email</th>
          <th class="py-2">Roles</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(u, i) in users" :key="i" class="border-b border-slate-100">
          <td class="py-2">{{ u.email }}</td>
          <td class="py-2">{{ u.roles.map((r) => r.role.name).join(", ") }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { api, getCsrf } from "@/lib/api";

export type Me = {
  id: string;
  email: string;
  name: string | null;
  emailVerified: boolean;
  roles: string[];
  permissions: string[];
};

export const useAuthStore = defineStore("auth", () => {
  const me = ref<Me | null>(null);
  const csrfToken = ref<string | null>(null);
  const loading = ref(false);

  const isAuthed = computed(() => !!me.value);

  async function refreshCsrf() {
    const r = await getCsrf();
    csrfToken.value = r.csrfToken;
  }

  async function refreshMe() {
    loading.value = true;
    try {
      me.value = await api<Me>("/api/v1/auth/me");
      await refreshCsrf();
    } catch {
      me.value = null;
      csrfToken.value = null;
    } finally {
      loading.value = false;
    }
  }

  function headersForWrite(): HeadersInit {
    const h: Record<string, string> = {};
    if (csrfToken.value) h["x-csrf-token"] = csrfToken.value;
    return h;
  }

  async function login(email: string, password: string) {
    const r = await api<{ user: Me; csrfToken: string }>("/api/v1/auth/login", {
      method: "POST",
      json: { email, password },
    });
    me.value = r.user;
    csrfToken.value = r.csrfToken;
  }

  async function register(body: { email: string; password: string; name?: string }) {
    const r = await api<{ user: Me; csrfToken: string }>("/api/v1/auth/register", {
      method: "POST",
      json: body,
    });
    me.value = r.user;
    csrfToken.value = r.csrfToken;
  }

  async function logout() {
    await api("/api/v1/auth/logout", {
      method: "POST",
      headers: headersForWrite(),
    });
    me.value = null;
    csrfToken.value = null;
  }

  return {
    me,
    csrfToken,
    loading,
    isAuthed,
    refreshMe,
    refreshCsrf,
    headersForWrite,
    login,
    register,
    logout,
  };
});

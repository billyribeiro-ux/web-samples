import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { apiFetch, apiJson, resetCsrf } from "@/lib/api";

export interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  emailVerified: boolean;
  roles: string[];
  subscription?: { plan: { slug: string; name: string }; status: string } | null;
}

export const useAuthStore = defineStore("auth", () => {
  const user = ref<AuthUser | null>(null);
  const loading = ref(false);

  const isAuthenticated = computed(() => !!user.value);
  const isAdmin = computed(() => user.value?.roles.includes("super-admin") ?? false);

  async function fetchMe() {
    loading.value = true;
    try {
      const data = await apiJson<{ user: AuthUser | null }>("/auth/me");
      user.value = data.user;
    } catch {
      user.value = null;
    } finally {
      loading.value = false;
    }
  }

  async function login(email: string, password: string) {
    const res = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { error?: string }).error ?? "Login failed");
    }
    await fetchMe();
  }

  async function register(payload: { email: string; password: string; name?: string }) {
    const res = await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { error?: string }).error ?? "Registration failed");
    }
  }

  async function logout() {
    await apiFetch("/auth/logout", { method: "POST" });
    resetCsrf();
    user.value = null;
  }

  return { user, loading, isAuthenticated, isAdmin, fetchMe, login, register, logout };
});

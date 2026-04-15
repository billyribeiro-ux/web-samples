export default defineNuxtRouteMiddleware(async (to) => {
  const requestFetch = useRequestFetch()
  const res = await requestFetch<{ user: { id: string } | null }>('/api/auth/me')
  if (!res.user) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }
  if (import.meta.client) {
    await useAuth().refresh()
  }
})

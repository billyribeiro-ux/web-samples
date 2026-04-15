export default defineNuxtRouteMiddleware(async (to) => {
  const requestFetch = useRequestFetch()
  const res = await requestFetch<{ user: { id: string } | null; roles: { slug: string }[] }>('/api/auth/me')
  if (!res.user) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }
  const ok = res.roles?.some((r) => ['super_admin', 'admin', 'editor'].includes(r.slug))
  if (!ok) {
    return navigateTo('/account')
  }
  if (import.meta.client) {
    await useAuth().refresh()
  }
})

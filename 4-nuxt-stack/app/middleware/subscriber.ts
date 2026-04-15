export default defineNuxtRouteMiddleware(async () => {
  const { user, refresh } = useAuth()
  await refresh()
  if (!user.value) {
    return navigateTo('/login?redirect=/members')
  }
  const requestFetch = useRequestFetch()
  const res = await requestFetch<{ ok: boolean; needPlan?: string }>('/api/members/access')
  if (!res.ok) {
    return navigateTo('/pricing')
  }
})

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const router = useRouter()

  function capture(name: string, props?: Record<string, unknown>) {
    if (!import.meta.client) return
    if (config.public.posthogKey && (window as unknown as { posthog?: { capture: Function } }).posthog) {
      ;(window as unknown as { posthog: { capture: Function } }).posthog.capture(name, props)
    }
    if (config.public.ga4Id && (window as unknown as { gtag?: Function }).gtag) {
      ;(window as unknown as { gtag: Function }).gtag('event', name, props)
    }
  }

  router.afterEach((to) => {
    capture('page_view', { path: to.path })
  })
})

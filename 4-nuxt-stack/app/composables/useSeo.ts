export function useSeo(opts: {
  title: string
  description?: string
  path?: string
  image?: string
  canonicalUrl?: string
  type?: 'website' | 'article'
  jsonLd?: Record<string, unknown>
}) {
  const config = useRuntimeConfig()
  const route = useRoute()
  const url = `${config.public.siteUrl}${opts.path ?? route.path}`
  useHead({
    title: opts.title,
    meta: [
      { name: 'description', content: opts.description || '' },
      { property: 'og:title', content: opts.title },
      { property: 'og:description', content: opts.description || '' },
      { property: 'og:url', content: url },
      { property: 'og:type', content: opts.type === 'article' ? 'article' : 'website' },
      ...(opts.image ? [{ property: 'og:image', content: opts.image }] : []),
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
    link: [{ rel: 'canonical', href: opts.canonicalUrl || url }],
  })
  if (opts.jsonLd) {
    useHead({
      script: [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify(opts.jsonLd),
        },
      ],
    })
  }
}

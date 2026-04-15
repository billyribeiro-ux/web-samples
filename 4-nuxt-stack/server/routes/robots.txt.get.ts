export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  const base = config.public.siteUrl.replace(/\/$/, '')
  setHeader(event, 'content-type', 'text/plain')
  return `User-agent: *
Allow: /

Sitemap: ${base}/sitemap.xml
`
})

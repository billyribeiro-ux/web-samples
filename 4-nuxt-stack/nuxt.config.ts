// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt'],

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },

  runtimeConfig: {
    sessionSecret: process.env.SESSION_SECRET || '',
    databaseUrl: process.env.DATABASE_URL || '',
    stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    resendApiKey: process.env.RESEND_API_KEY || '',
    emailFrom: process.env.EMAIL_FROM || '',
    s3Region: process.env.S3_REGION || '',
    s3Bucket: process.env.S3_BUCKET || '',
    s3AccessKey: process.env.S3_ACCESS_KEY || '',
    s3SecretKey: process.env.S3_SECRET_KEY || '',
    s3PublicBaseUrl: process.env.S3_PUBLIC_BASE_URL || '',
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      siteName: process.env.NUXT_PUBLIC_SITE_NAME || 'Apex Digital',
      posthogKey: process.env.NUXT_PUBLIC_POSTHOG_KEY || '',
      posthogHost: process.env.NUXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
      ga4Id: process.env.NUXT_PUBLIC_GA4_ID || '',
      stripePublishableKey: process.env.NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
    },
  },

  routeRules: {
    '/': { swr: 60 },
    '/blog/**': { swr: 120 },
    '/products/**': { swr: 120 },
    '/admin/**': { ssr: true },
    '/api/**': { cors: true },
  },

  nitro: {
    experimental: {
      openAPI: false,
    },
    // Dev: use in-memory payload cache so `.nuxt/cache/nuxt/payload` cannot turn into a *file*
    // (ENOTDIR on nested routes like `/products/*` when SWR + filesystem storage conflict).
    ...(process.env.NODE_ENV === 'development' && {
      storage: {
        'cache:nuxt:payload': { driver: 'memory' },
      },
    }),
  },
})

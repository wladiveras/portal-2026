// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  extends: ['./layers/1-base', './layers/2-dashboard'],
  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss', '@nuxtjs/supabase'],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    /**
     * Supabase service role / secret key — server only. We accept both the
     * legacy `SUPABASE_SERVICE_KEY` and the new `NUXT_SUPABASE_SECRET_KEY`
     * (Nuxt Supabase migrated to the latter; see https://supabase.com/blog/jwt-signing-keys).
     */
    supabaseServiceKey:
      process.env.SUPABASE_SERVICE_KEY ??
      process.env.NUXT_SUPABASE_SECRET_KEY ??
      '',
    databaseUrl: process.env.DATABASE_URL ?? process.env.NUXT_DATABASE_URL ?? ''
  },
  supabase: {
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      include: ['/dashboard/**'],
      exclude: ['/']
    }
  },
  nitro: {
    publicAssets: [
      {
        dir: 'media',
        maxAge: 60 * 60 * 24 * 365
      },
      {
        dir: '.',
        maxAge: 60 * 60 * 24 * 7
      }
    ]
  },
  app: {
    head: {
      title: 'Wladi Veras | Portfolio',
      meta: [
        {
          name: 'description',
          content:
            'Portfolio autoral com foco em design premium, engenharia fullstack e experiencias digitais.'
        },
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover'
        }
      ]
    }
  }
})

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],
  nitro: {
    publicAssets: [
      {
        dir: 'public',
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
        }
      ]
    }
  }
})

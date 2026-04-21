import { defineVitestConfig } from '@nuxt/test-utils/config'

// Stub Supabase env so @nuxtjs/supabase plugin boots inside tests without noise.
process.env.SUPABASE_URL = process.env.SUPABASE_URL ?? 'http://localhost:54321'
process.env.SUPABASE_KEY = process.env.SUPABASE_KEY ?? 'test-anon-key'
process.env.NUXT_PUBLIC_SUPABASE_URL = process.env.SUPABASE_URL
process.env.NUXT_PUBLIC_SUPABASE_KEY = process.env.SUPABASE_KEY

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    environmentOptions: {
      nuxt: {
        domEnvironment: 'happy-dom'
      }
    },
    include: ['tests/**/*.spec.ts']
  }
})

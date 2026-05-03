import { defineConfig } from 'drizzle-kit'

const databaseUrl = process.env.DATABASE_URL ?? process.env.NUXT_DATABASE_URL ?? ''

export default defineConfig({
  out: './drizzle',
  schema: './server/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl
  }
})

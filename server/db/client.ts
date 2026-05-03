import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as schema from './schema'

let cached:
  | {
      client: postgres.Sql
      db: ReturnType<typeof drizzle<typeof schema>>
    }
  | null = null

function getDatabaseUrl(): string {
  return process.env.DATABASE_URL ?? process.env.NUXT_DATABASE_URL ?? ''
}

export function hasDatabaseUrl(): boolean {
  return Boolean(getDatabaseUrl())
}

export function getDrizzle() {
  if (cached) return cached.db

  const databaseUrl = getDatabaseUrl()
  if (!databaseUrl) {
    throw createError({
      statusCode: 500,
      statusMessage: 'DATABASE_URL (or NUXT_DATABASE_URL) is required for Drizzle'
    })
  }

  const client = postgres(databaseUrl, { max: 2, prepare: false })
  const db = drizzle(client, { schema })
  cached = { client, db }
  return db
}

export function tryGetDrizzle() {
  if (!hasDatabaseUrl()) return null
  return getDrizzle()
}

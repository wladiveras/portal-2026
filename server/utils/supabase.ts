import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { H3Event } from 'h3'
import type { Database } from '~/types/database.types'

let cached: SupabaseClient<Database> | null = null

/**
 * Returns a Supabase client bound to the **service role** key.
 *
 * IMPORTANT — server only. Never import this file from `app/**`. The service
 * role bypasses RLS and must stay inside the Nitro bundle. `runtimeConfig`
 * exposes the key via `runtimeConfig.supabaseServiceKey` (`SUPABASE_SERVICE_KEY`
 * env) and the URL is mirrored in `runtimeConfig.public.supabase.url`
 * (populated by @nuxtjs/supabase).
 */
export function serverSupabaseServiceRole(_event?: H3Event): SupabaseClient<Database> {
  if (cached) return cached
  const config = useRuntimeConfig(_event)
  const url =
    (config.public as { supabase?: { url?: string } }).supabase?.url ??
    process.env.SUPABASE_URL ??
    process.env.NUXT_PUBLIC_SUPABASE_URL ??
    ''
  const serviceKey =
    (config.supabaseServiceKey as string | undefined) ??
    process.env.SUPABASE_SERVICE_KEY ??
    process.env.NUXT_SUPABASE_SECRET_KEY ??
    ''
  if (!url || !serviceKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Supabase service role not configured (SUPABASE_URL or SUPABASE_SERVICE_KEY missing)'
    })
  }
  cached = createClient<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
  return cached
}

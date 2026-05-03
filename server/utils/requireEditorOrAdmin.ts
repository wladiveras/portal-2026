import { serverSupabaseClient } from '#supabase/server'
import type { H3Event } from 'h3'
import type { Database } from '~/types/database.types'

export interface EditorContext {
  userId: string
}

/**
 * Guard for editor/admin Nitro endpoints.
 */
export async function requireEditorOrAdmin(event: H3Event): Promise<EditorContext> {
  const authClient = await serverSupabaseClient<Database>(event)
  const { data: userRes } = await authClient.auth.getUser()
  const userId = userRes.user?.id
  if (!userId) throw createError({ statusCode: 401, statusMessage: 'auth required' })

  const { data: profile } = await authClient
    .from('profiles')
    .select('role,disabled')
    .eq('id', userId)
    .maybeSingle()
  if (!profile || profile.disabled || !['admin', 'editor'].includes(profile.role)) {
    throw createError({ statusCode: 403, statusMessage: 'editor/admin only' })
  }

  return { userId }
}
